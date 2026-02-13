import stripe
from typing import Optional, Dict
from app.core.config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY


class SubscriptionService:
    """
    Handles Stripe subscription management for FitLife Pro ($4.99/month).
    """
    
    @staticmethod
    def create_customer(email: str, name: Optional[str] = None) -> str:
        """Create a Stripe customer."""
        customer = stripe.Customer.create(
            email=email,
            name=name
        )
        return customer.id
    
    @staticmethod
    def create_subscription(customer_id: str, price_id: Optional[str] = None) -> Dict:
        """
        Create a subscription for the customer.
        Returns the client secret for the subscription (for Stripe Elements).
        """
        if not price_id:
            price_id = settings.STRIPE_PRICE_ID
        
        # Create subscription with incomplete status (requires payment)
        subscription = stripe.Subscription.create(
            customer=customer_id,
            items=[{"price": price_id}],
            payment_behavior="default_incomplete",
            expand=["latest_invoice.payment_intent"],
        )
        
        return {
            "subscription_id": subscription.id,
            "client_secret": subscription.latest_invoice.payment_intent.client_secret,
            "status": subscription.status
        }
    
    @staticmethod
    def cancel_subscription(subscription_id: str) -> bool:
        """Cancel a subscription at period end."""
        try:
            stripe.Subscription.modify(
                subscription_id,
                cancel_at_period_end=True
            )
            return True
        except stripe.error.StripeError:
            return False
    
    @staticmethod
    def get_subscription_status(subscription_id: str) -> str:
        """Get the current status of a subscription."""
        try:
            subscription = stripe.Subscription.retrieve(subscription_id)
            return subscription.status  # active, canceled, past_due, etc.
        except stripe.error.StripeError:
            return "unknown"
    
    @staticmethod
    def create_checkout_session(customer_id: str, success_url: str, cancel_url: str) -> Dict:
        """Create a Stripe Checkout session for subscription."""
        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            line_items=[{
                "price": settings.STRIPE_PRICE_ID,
                "quantity": 1,
            }],
            mode="subscription",
            success_url=success_url,
            cancel_url=cancel_url,
        )
        return {
            "session_id": session.id,
            "url": session.url
        }
    
    @staticmethod
    def handle_webhook(payload: bytes, sig_header: str) -> Dict:
        """Handle Stripe webhook events."""
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError:
            return {"error": "Invalid payload"}
        except stripe.error.SignatureVerificationError:
            return {"error": "Invalid signature"}
        
        event_type = event["type"]
        data = event["data"]["object"]
        
        result = {
            "type": event_type,
            "handled": False
        }
        
        if event_type == "customer.subscription.created":
            result["customer_id"] = data.get("customer")
            result["subscription_id"] = data.get("id")
            result["status"] = data.get("status")
            result["handled"] = True
            
        elif event_type == "customer.subscription.updated":
            result["customer_id"] = data.get("customer")
            result["subscription_id"] = data.get("id")
            result["status"] = data.get("status")
            result["cancel_at_period_end"] = data.get("cancel_at_period_end")
            result["handled"] = True
            
        elif event_type == "customer.subscription.deleted":
            result["customer_id"] = data.get("customer")
            result["subscription_id"] = data.get("id")
            result["handled"] = True
            
        elif event_type == "invoice.payment_succeeded":
            result["customer_id"] = data.get("customer")
            result["subscription_id"] = data.get("subscription")
            result["handled"] = True
            
        elif event_type == "invoice.payment_failed":
            result["customer_id"] = data.get("customer")
            result["subscription_id"] = data.get("subscription")
            result["handled"] = True
        
        return result
    
    @staticmethod
    def create_portal_session(customer_id: str, return_url: str) -> str:
        """Create a Stripe Customer Portal session."""
        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=return_url,
        )
        return session.url
