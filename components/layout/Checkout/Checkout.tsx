"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ShieldCheck, Truck } from "lucide-react";
import Container from "@/components/Container";
import SavedAddress from "./address/saved-address";
import AddressForm from "./address/address-form";
import QrPayment from "./QrPayment";
import CheckoutConfirmModal from "./CheckoutConfirmModal";
import {
  getAddresses,
  saveAddress as persistAddress,
  deleteAddress,
} from "@/lib/addressService";
import { useCart } from "@/hooks/useCart";
import { CartProduct, getCartProducts } from "@/utils/cartHelper";
import { placeOrder, calculateShippingCharge, type PaymentMethod } from "@/lib/orderService";
import Image from "next/image";
import { getSafeImageSrc } from "@/lib/image";
import { storage } from "@/config/firebase.config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface SavedAddressData {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  province: string;
  city: string;
  district: string;
  zipCode: string;
}

const mockSavedAddresses: SavedAddressData[] = [];

export default function Checkout() {
  const router = useRouter();
  const { user } = useUser();
  const { cart, clearCart } = useCart();
  const [cartProducts, setCartProducts] = useState<CartProduct[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddressData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await getCartProducts(cart);

      setCartProducts(data);
    };

    load();
  }, [cart]);

  useEffect(() => {
    const loadAddresses = async () => {
      if (!user?.id) {
        setSavedAddresses([]);
        return;
      }

      try {
        const addresses = await getAddresses(user.id);

        setSavedAddresses(
          addresses.map((address, index) => ({
            id: address.id ?? `saved-${index}`,
            label: address.isDefault
              ? "Default address"
              : `Saved address ${index + 1}`,
            fullName: address.fullName,
            phone: address.phone,
            email: address.email,
            address: address.address,
            city: address.city,
            province: address.province,
            district: address.district,
            zipCode: address.zipCode,
          })),
        );
      } catch (error) {
        console.error("Failed to load saved addresses:", error);
        setSavedAddresses([]);
      }
    };

    loadAddresses();
  }, [user?.id]);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [transactionId, setTransactionId] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(
    null,
  );
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    province: "",
    city: "",
    district: "",
    zipCode: "",
    saveAddress: false,
  });

  const subtotal = cartProducts.reduce((total, item) => {
    const discountedPrice = item.price - item.discount;
    return total + discountedPrice * item.quantity;
  }, 0);

  const shipping = formData.district ? calculateShippingCharge(formData.district) : 0;
  
  const discount = cartProducts.reduce((total, item) => {
    return total + item.discount * item.quantity;
  }, 0);
  
  const total = subtotal + shipping;

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, saveAddress: checked }));
  };

  const handleDistrictChange = (value: string | null) => {
    setFormData((prev) => ({ ...prev, district: value ?? "" }));
  };

  const handleSelectAddress = (address: SavedAddressData) => {
    setSelectedAddressId(address.id);
    setShowAddressForm(false);
    setFormData((prev) => ({
      ...prev,
      fullName: address.fullName,
      phone: address.phone,
      email: address.email,
      address: address.address,
      province: address.province,
      city: address.city,
      district: address.district,
      zipCode: address.zipCode,
    }));
  };

  const handleAddNewAddress = () => {
    setShowAddressForm(true);
    setSelectedAddressId(null);
    setFormData({
      fullName: "",
      phone: "",
      email: "",
      address: "",
      province: "",
      city: "",
      district: "",
      zipCode: "",
      saveAddress: false,
    });
    setFormErrors({});
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!user?.id) return;
    try {
      await deleteAddress(user.id, addressId);
      
      const addresses = await getAddresses(user.id);
      setSavedAddresses(
        addresses.map((address, index) => ({
          id: address.id ?? `saved-${index}`,
          label: address.isDefault
            ? "Default address"
            : `Saved address ${index + 1}`,
          fullName: address.fullName,
          phone: address.phone,
          email: address.email,
          address: address.address,
          city: address.city,
          province: address.province,
          district: address.district,
          zipCode: address.zipCode,
        })),
      );

      if (selectedAddressId === addressId) {
        setSelectedAddressId(null);
        setFormData({
          fullName: "",
          phone: "",
          email: "",
          address: "",
          province: "",
          city: "",
          district: "",
          zipCode: "",
          saveAddress: false,
        });
      }
      
      toast.success("Address deleted successfully.");
    } catch (error) {
      console.error("Failed to delete address:", error);
      toast.error("Failed to delete address.");
    }
  };
  const validateAddressForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    if (!formData.address.trim()) errors.address = "Address is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.district) errors.district = "District is required";
    if (!formData.zipCode.trim()) errors.zipCode = "ZIP code is required";
    return errors;
  };

  const handleSaveAddress = async () => {
    const errors = validateAddressForm();
    if (Object.keys(errors).length === 0) {
      setSelectedAddressId("new-" + Date.now());
      setFormErrors({});
      setShowAddressForm(false);
      if (formData.saveAddress && user?.id) {
        try {
          await persistAddress(user.id, {
            fullName: formData.fullName.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim(),
            address: formData.address.trim(),
            province: formData.province.trim(),
            city: formData.city.trim(),
            district: formData.district.trim(),
            zipCode: formData.zipCode.trim(),
            isDefault: true,
          });

          const addresses = await getAddresses(user.id);
          setSavedAddresses(
            addresses.map((address, index) => ({
              id: address.id ?? `saved-${index}`,
              label: address.isDefault
                ? "Default address"
                : `Saved address ${index + 1}`,
              fullName: address.fullName,
              phone: address.phone,
              email: address.email,
              address: address.address,
              province: address.province,
              city: address.city,
              district: address.district,
              zipCode: address.zipCode,
            })),
          );

          toast.success("Address saved for future checkouts.");
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Unable to save address right now.";
          setFormErrors({ submit: message });
          toast.error(message);
          return;
        }
      }

      if (formData.saveAddress && !user?.id) {
        toast("Sign in to save this address for future checkouts.");
      }
    } else {
      setFormErrors(errors);
    }
  };

  const validateCheckout = () => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    if (!formData.address.trim()) errors.address = "Address is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.district) errors.district = "District is required";
    if (!formData.zipCode.trim()) errors.zipCode = "ZIP code is required";
    if (cartProducts.length === 0) errors.cart = "Your cart is empty";
    if (paymentMethod === "qr") {
      if (!transactionId.trim())
        errors.transactionId = "Transaction ID is required";
      if (!paymentScreenshot)
        errors.paymentScreenshot = "Payment screenshot is required";
    }
    return errors;
  };

  const handleConfirmOrder = () => {
    const errors = validateCheckout();
    if (Object.keys(errors).length === 0) {
      setFormErrors({});
      setShowConfirmDialog(true);
    } else {
      setFormErrors(errors);
      console.log("[v0] Validation errors:", errors);
    }
  };

  const processOrder = async () => {
    setShowConfirmDialog(false);
    setIsSubmitting(true);
      try {
        let screenshotUrl = "";
        if (paymentMethod === "qr" && paymentScreenshot) {
          const path = `payment-screenshots/${Date.now()}-${paymentScreenshot.name}`;
          const storageRef = ref(storage, path);
          await uploadBytes(storageRef, paymentScreenshot);
          screenshotUrl = await getDownloadURL(storageRef);
        }

        if (!user?.id) {
          throw new Error("You must be logged in to place an order.");
        }

        const orderId = await placeOrder({
          userId: user.id,
          paymentMethod,
          transactionId: paymentMethod === "qr" ? transactionId.trim() : undefined,
          paymentScreenshot:
            paymentMethod === "qr" ? screenshotUrl : undefined,
          shippingAddress: {
            fullName: formData.fullName.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim(),
            address: formData.address.trim(),
            city: formData.city.trim(),
            district: formData.district.trim(),
            zipCode: formData.zipCode.trim(),
          },
          items: cartProducts.map((item) => ({
            productId: item._id,
            title: item.name,
            thumbnail: item.thumbnail,
            price: item.price,
            discount: item.discount,
            quantity: item.quantity,
            sku: item.sku,
          })),
        });

        try {
          await clearCart();
        } catch (clearError) {
          console.error(
            "Failed to clear cart after order placement:",
            clearError,
          );
        }

        setPlacedOrderId(orderId);
        setFormErrors({});
        toast.success(
          paymentMethod === "qr"
            ? "Order placed successfully. We'll verify your payment shortly."
            : "Order placed successfully. Cash on delivery selected.",
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to place order right now.";
        setFormErrors({ submit: message });
        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
  };

  if (placedOrderId) {
    return (
      <Container>
        <div className="bg-background py-34">
          <div className="mx-auto max-w-3xl">
            <Card className="border-border/70 shadow-sm">
              <CardHeader className="space-y-3">
                <Badge variant="secondary" className="w-fit">
                  {paymentMethod === "qr" ? "Manual QR Payment" : "Cash on Delivery"}
                </Badge>
                <CardTitle className="text-3xl tracking-tight">
                  Order confirmed
                </CardTitle>
                <CardDescription className="text-base">
                  {paymentMethod === "qr"
                    ? "Your checkout is complete. We have received your order and will verify your payment manually before dispatch."
                    : "Your checkout is complete. We have received your COD order and will contact you using the details you provided."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <Alert className="border-green-200 bg-green-50 text-green-900">
                  <AlertDescription>
                    Order reference: {placedOrderId}
                  </AlertDescription>
                </Alert>

                <div className="rounded-xl border bg-muted/40 p-4 text-sm space-y-2">
                  <p className="font-medium">What happens next</p>
                  <p className="text-muted-foreground">
                    We will review the order, prepare your items, and confirm
                    delivery before dispatch.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    onClick={() => router.push("/shop")}
                    className="flex-1"
                  >
                    Continue Shopping
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/order")}
                    className="flex-1"
                  >
                    View My Orders
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="min-h-screen bg-background py-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
          <p className="mt-2 text-muted-foreground">
            Please fill in your details and complete your order
          </p>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Main Form Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Information */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-semibold">
                      1
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        Shipping Information
                      </CardTitle>
                      <CardDescription>
                        Select a saved address or add a new one
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Saved Addresses */}
                  {savedAddresses.length > 0 && !showAddressForm && (
                    <SavedAddress
                      mockSavedAddresses={savedAddresses}
                      handleSelectAddress={handleSelectAddress}
                      handleAddNewAddress={handleAddNewAddress}
                      handleDeleteAddress={handleDeleteAddress}
                      selectedAddressId={selectedAddressId}
                    />
                  )}

                  {/* Address Form */}
                  {(showAddressForm || savedAddresses.length === 0) && (
                    <AddressForm
                      formData={formData}
                      handleInputChange={handleInputChange}
                      formErrors={formErrors}
                      handleSaveAddress={handleSaveAddress}
                      mockSavedAddresses={mockSavedAddresses}
                      setShowAddressForm={setShowAddressForm}
                      handleDistrictChange={handleDistrictChange}
                      handleCheckboxChange={handleCheckboxChange}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-semibold">
                      2
                    </div>
                    <div>
                      <CardTitle className="text-lg">Payment Method</CardTitle>
                      <CardDescription>
                        Choose how you&apos;d like to pay for your order.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value) =>
                      setPaymentMethod(value as PaymentMethod)
                    }
                  >
                    <div
                      onClick={() => setPaymentMethod("cod")}
                      className={`rounded-xl border p-4 cursor-pointer transition-colors ${
                        paymentMethod === "cod"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value="cod" id="payment-cod" />
                        <div className="mt-0.5 hidden  md:flex h-10 w-10 items-center  justify-center rounded-full bg-primary text-white">
                          <Truck className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold">Cash on delivery</p>
                          <p className="text-sm text-muted-foreground">
                            Pay in cash when your order is delivered. No QR
                            scan, transaction ID, or upload step is required.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      onClick={() => setPaymentMethod("qr")}
                      className={`rounded-xl border p-4 cursor-pointer transition-colors ${
                        paymentMethod === "qr"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value="qr" id="payment-qr" />
                        <div className="mt-0.5 hidden  md:flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold">Manual QR Payment</p>
                          <p className="text-sm text-muted-foreground">
                            Scan the QR code, pay via your wallet app, and
                            submit your transaction ID and screenshot for
                            verification.
                          </p>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {paymentMethod === "qr" && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Scan &amp; Pay via QR</CardTitle>
                    <CardDescription>
                      Complete your payment and submit the details below.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <QrPayment
                      amount={total}
                      merchantName="Vault Enterprises Pvt. Ltd."
                      walletName="Bank"
                      walletNumber="9800000000"
                      transactionId={transactionId}
                      onTransactionIdChange={setTransactionId}
                      screenshot={paymentScreenshot}
                      onScreenshotChange={setPaymentScreenshot}
                      errors={formErrors}
                    />
                  </CardContent>
                </Card>
              )}

              {formErrors.cart && (
                <p className="text-xs text-red-600">{formErrors.cart}</p>
              )}
              {formErrors.submit && (
                <p className="text-xs text-red-600">{formErrors.submit}</p>
              )}

              {/* Confirm Button */}
              <Button
                onClick={handleConfirmOrder}
                className="w-full"
                size="lg"
                disabled={
                  isSubmitting ||
                  !formData.fullName ||
                  !formData.phone ||
                  !formData.address ||
                  !formData.city ||
                  !formData.district ||
                  !formData.zipCode ||
                  cartProducts.length === 0 ||
                  (paymentMethod === "qr" &&
                    (!transactionId.trim() || !paymentScreenshot))
                }
              >
                {isSubmitting ? "Placing Order..." : "Confirm Order"}
              </Button>

              {/* Information Alert */}
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertDescription className="text-yellow-800 text-sm">
                  {paymentMethod === "qr"
                    ? "Manual QR payment is active. Please double-check your transaction ID and screenshot before placing the order."
                    : "Cash on delivery is active. Please make sure your phone number and address are correct before placing the order."}
                </AlertDescription>
              </Alert>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Order Summary</CardTitle>
                    <Badge variant="secondary">
                      {cartProducts.length} Items
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3">
                    {cartProducts.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-3 pb-3 border-b border-border last:border-0 last:pb-0"
                      >
                        <div>
                          <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center overflow-hidden">
                            <Image
                              src={getSafeImageSrc(item.thumbnail)}
                              alt={item.name}
                              width={100}
                              height={100}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-pretty">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-right">
                          NPR {item.price.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-2 border-t border-border pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>NPR {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Shipping Charge
                      </span>
                      <span>NPR {shipping}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-red-600">- NPR {discount}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-border pt-3">
                      <span>Total Amount</span>
                      <span className="text-primary">
                        NPR {total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Security Badge */}
                  <div className="bg-muted p-3 rounded-lg flex gap-2 text-sm">
                    <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-xs">
                        {paymentMethod === "qr"
                          ? "100% Secure Manual QR Payment"
                          : "100% Secure COD"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {paymentMethod === "qr"
                          ? "Your order will be verified manually after payment confirmation."
                          : "Your order will be confirmed and processed for delivery."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <CheckoutConfirmModal
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={processOrder}
        isSubmitting={isSubmitting}
        orderTotal={total}
        paymentMethod={paymentMethod}
        shippingAddress={{
          fullName: formData.fullName,
          address: formData.address,
          city: formData.city,
          district: formData.district,
        }}
      />
    </Container>
  );
}