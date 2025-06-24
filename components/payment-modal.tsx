"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Calendar, Lock, User, DollarSign } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  conference: {
    _id: string
    title: string
    ticketPrice: number
    currency: string
    startDate: string
    location: string
  }
  onPaymentSuccess: () => void
}

export default function PaymentModal({ isOpen, onClose, conference, onPaymentSuccess }: PaymentModalProps) {
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [cardNumber, setCardNumber] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [cardName, setCardName] = useState("")
  const [billingAddress, setBillingAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
  })

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(price)
  }

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4)
    }
    return v
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    if (formatted.length <= 19) {
      // 16 digits + 3 spaces
      setCardNumber(formatted)
    }
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value)
    if (formatted.length <= 5) {
      setExpiryDate(formatted)
    }
  }

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "")
    if (value.length <= 4) {
      setCvv(value)
    }
  }

  const handleCardPayment = async () => {
    if (!cardNumber || !expiryDate || !cvv || !cardName) {
      alert("Please fill in all card details")
      return
    }

    try {
      setProcessing(true)

      // Simulate payment processing
      const response = await fetch("/api/payment/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conferenceId: conference._id,
          amount: conference.ticketPrice,
          currency: conference.currency,
          paymentMethod: "card",
          cardDetails: {
            number: cardNumber.replace(/\s/g, ""),
            expiry: expiryDate,
            cvv: cvv,
            name: cardName,
          },
          billingAddress,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Register for the conference
        const enrollResponse = await fetch("/api/enrollment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ conferenceID: conference._id }),
        })

        const enrollData = await enrollResponse.json()

        if (enrollData.success) {
          alert("Payment successful! You are now registered for the conference.")
          onPaymentSuccess()
          onClose()
        } else {
          alert("Payment processed but registration failed. Please contact support.")
        }
      } else {
        alert(data.message || "Payment failed. Please try again.")
      }
    } catch (error) {
      console.error("Error processing payment:", error)
      alert("An error occurred while processing payment")
    } finally {
      setProcessing(false)
    }
  }

  const handlePayPalPayment = async () => {
    try {
      setProcessing(true)

      // Create PayPal payment
      const response = await fetch("/api/payment/paypal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conferenceId: conference._id,
        }),
      })

      const data = await response.json()

      if (data.success && data.approvalUrl) {
        // Redirect to PayPal for approval
        window.location.href = data.approvalUrl
      } else {
        alert(data.message || "Failed to create PayPal payment. Please try again.")
      }
    } catch (error) {
      console.error("Error creating PayPal payment:", error)
      alert("An error occurred while setting up PayPal payment")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Your Registration</DialogTitle>
          <DialogDescription>Choose your payment method to register for the conference</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{conference.title}</h3>
                  <p className="text-sm text-muted-foreground">{conference.location}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(conference.startDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <Badge variant="secondary">1 Ticket</Badge>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total</span>
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(conference.ticketPrice, conference.currency)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="card" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Credit Card
                  </TabsTrigger>
                  <TabsTrigger value="paypal" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    PayPal
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="card" className="space-y-4 mt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardName">Cardholder Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="cardName"
                          placeholder="John Doe"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="expiryDate"
                            placeholder="MM/YY"
                            value={expiryDate}
                            onChange={handleExpiryChange}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input id="cvv" placeholder="123" value={cvv} onChange={handleCvvChange} className="pl-10" />
                        </div>
                      </div>
                    </div>

                    {/* Billing Address */}
                    <div className="space-y-4 border-t pt-4">
                      <h4 className="font-medium">Billing Address</h4>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="street">Street Address</Label>
                          <Input
                            id="street"
                            placeholder="123 Main St"
                            value={billingAddress.street}
                            onChange={(e) => setBillingAddress({ ...billingAddress, street: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              placeholder="New York"
                              value={billingAddress.city}
                              onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input
                              id="state"
                              placeholder="NY"
                              value={billingAddress.state}
                              onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="zipCode">ZIP Code</Label>
                            <Input
                              id="zipCode"
                              placeholder="10001"
                              value={billingAddress.zipCode}
                              onChange={(e) => setBillingAddress({ ...billingAddress, zipCode: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Select
                              value={billingAddress.country}
                              onValueChange={(value) => setBillingAddress({ ...billingAddress, country: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="US">United States</SelectItem>
                                <SelectItem value="CA">Canada</SelectItem>
                                <SelectItem value="GB">United Kingdom</SelectItem>
                                <SelectItem value="AU">Australia</SelectItem>
                                <SelectItem value="DE">Germany</SelectItem>
                                <SelectItem value="FR">France</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button onClick={handleCardPayment} disabled={processing} className="w-full" size="lg">
                      {processing
                        ? "Processing Payment..."
                        : `Pay ${formatPrice(conference.ticketPrice, conference.currency)}`}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="paypal" className="space-y-4 mt-6">
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                        <DollarSign className="h-12 w-12 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Pay with PayPal</h3>
                      <p className="text-muted-foreground">
                        Click below to securely pay with PayPal. You'll be redirected to PayPal to complete your
                        payment.
                      </p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span>Total Amount:</span>
                        <span className="text-xl font-bold">
                          {formatPrice(conference.ticketPrice, conference.currency)}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={handlePayPalPayment}
                      disabled={processing}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      size="lg"
                    >
                      {processing ? "Redirecting to PayPal..." : "Continue with PayPal"}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg">
            <Lock className="h-4 w-4" />
            <span>Your payment information is encrypted and secure. We never store your credit card details.</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
