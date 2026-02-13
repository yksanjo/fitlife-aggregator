from fastapi import APIRouter, Depends, Request, Header
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.routers.auth import get_current_user
from app.models.user import User
from app.services.subscription import SubscriptionService
from app.core.config import settings

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])


@router.post("/create-customer")
def create_stripe_customer(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a Stripe customer for the current user."""
    if current_user.stripe_customer_id:
        return {"customer_id": current_user.stripe_customer_id}
    
    customer_id = SubscriptionService.create_customer(
        email=current_user.email,
        name=f"{current_user.first_name or ''} {current_user.last_name or ''}".strip()
    )
    
    current_user.stripe_customer_id = customer_id
    db.commit()
    
    return {"customer_id": customer_id}


@router.post("/checkout")
def create_checkout_session(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a Stripe Checkout session for subscription."""
    if not current_user.stripe_customer_id:
        # Create customer first
        customer_id = SubscriptionService.create_customer(
            email=current_user.email,
            name=f"{current_user.first_name or ''} {current_user.last_name or ''}".strip()
        )
        current_user.stripe_customer_id = customer_id
        db.commit()
    
    session = SubscriptionService.create_checkout_session(
        customer_id=current_user.stripe_customer_id,
        success_url=f"{settings.FRONTEND_URL}/subscription/success",
        cancel_url=f"{settings.FRONTEND_URL}/subscription/cancel"
    )
    
    return session


@router.get("/status")
def get_subscription_status(current_user: User = Depends(get_current_user)):
    """Get the current subscription status."""
    if not current_user.stripe_subscription_id:
        return {
            "is_premium": False,
            "status": "inactive",
            "has_customer_id": bool(current_user.stripe_customer_id)
        }
    
    status = SubscriptionService.get_subscription_status(
        current_user.stripe_subscription_id
    )
    
    return {
        "is_premium": current_user.is_premium,
        "stripe_status": status,
        "subscription_id": current_user.stripe_subscription_id
    }


@router.post("/cancel")
def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel the subscription at period end."""
    if not current_user.stripe_subscription_id:
        return {"error": "No active subscription"}
    
    success = SubscriptionService.cancel_subscription(
        current_user.stripe_subscription_id
    )
    
    if success:
        # Note: The webhook will actually update the is_premium flag
        return {
            "success": True,
            "message": "Subscription will cancel at period end"
        }
    
    return {"error": "Failed to cancel subscription"}


@router.post("/portal")
def create_portal_session(current_user: User = Depends(get_current_user)):
    """Create a Stripe Customer Portal session."""
    if not current_user.stripe_customer_id:
        return {"error": "No Stripe customer"}
    
    url = SubscriptionService.create_portal_session(
        customer_id=current_user.stripe_customer_id,
        return_url=f"{settings.FRONTEND_URL}/settings/billing"
    )
    
    return {"url": url}


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: Optional[str] = Header(None, alias="Stripe-Signature"),
    db: Session = Depends(get_db)
):
    """Handle Stripe webhook events."""
    payload = await request.body()
    
    if not stripe_signature:
        return {"error": "Missing signature"}
    
    result = SubscriptionService.handle_webhook(payload, stripe_signature)
    
    if result.get("error"):
        return result
    
    # Handle specific events
    if result.get("handled"):
        customer_id = result.get("customer_id")
        
        # Find user by Stripe customer ID
        user = db.query(User).filter(
            User.stripe_customer_id == customer_id
        ).first()
        
        if user:
            if result["type"] == "customer.subscription.created":
                user.stripe_subscription_id = result.get("subscription_id")
                if result.get("status") == "active":
                    user.is_premium = True
                    
            elif result["type"] == "customer.subscription.updated":
                user.is_premium = result.get("status") == "active"
                
            elif result["type"] == "customer.subscription.deleted":
                user.is_premium = False
                user.stripe_subscription_id = None
                
            elif result["type"] == "invoice.payment_failed":
                # Could notify user about payment failure
                pass
            
            db.commit()
    
    return {"received": True}
