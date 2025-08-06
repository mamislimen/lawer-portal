import Stripe from "stripe"
import { prisma } from "@/lib/prisma" // Correct import path to your prisma file

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  //apiVersion: "2023-10-16", // Ensure you're using the correct Stripe API version
})

export class PaymentService {
  async createPaymentIntent(amount: number, currency = "usd", metadata: any = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      })

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error creating payment intent:", error.message)
      }
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  async createCustomer(email: string, name: string, metadata: any = {}) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata,
      })

      return { success: true, customerId: customer.id }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error creating customer:", error.message)
      }
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  async cancelSubscription(subscriptionId: string) {
    // Subscription logic has been removed as it's not needed
    return { success: false, error: "Subscription handling has been removed from the system." }
  }

  async handleWebhook(body: string, signature: string) {
    try {
      const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)

     // switch (event.type) {
       // case "payment_intent.succeeded":
       //   await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent)
       //   break
     //   default:
      //    console.log(`Unhandled event type: ${event.type}`)
    //  }

     // return { success: true }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Webhook error:", error.message)
      }
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

 // private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    // Update payment record in the database
    //await prisma.payment.update({
     // where: { stripePaymentIntentId: paymentIntent.id },
     // data: {
       // status: "paid",
       // paidAt: new Date(),
      //},
    //})
 // }
}
