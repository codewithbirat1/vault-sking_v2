import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Upload } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
interface QrPaymentProps {
  amount: number;
  merchantName: string;
  walletName: string;
  walletNumber: string;
  phone:string;
  transactionId: string;
  onTransactionIdChange: (value: string) => void;
  screenshot: File | null;
  onScreenshotChange: (file: File | null) => void;
  errors: Record<string, string>;
}

const QrPayment = ({
  amount,
  merchantName,
  walletName,
  walletNumber,
  phone,
  transactionId,
  onTransactionIdChange,
  screenshot,
  onScreenshotChange,
  errors,
}: QrPaymentProps) => {
  const handleCopyNumber = async () => {
    try {
      await navigator.clipboard.writeText(walletNumber);
      toast.success("Wallet number copied");
    } catch {
      toast.error("Unable to copy number");
    }
  };

  const handleScreenshotSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0] ?? null;
    onScreenshotChange(file);
  };

  return (
    <div className="space-y-1">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* QR Code */}
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-muted/40 p-3 self-start">
          <div className="flex aspect-square w-full max-w-[250px] items-center justify-center rounded-lg border border-dashed border-border">
            <Image
              src="/Images/vault_enterprises-qr.svg"
              alt="Vault Enterprises QR Code"
              width={300}
              height={300}
              priority
              className="h-full w-full object-contain"
            />
          </div>

          <p className="text-md text-muted-foreground  font-bold">
            Scan with your wallet app
          </p>
        </div>

        {/* Merchant / wallet details */}
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground">Merchant Name</p>
            <p className="text-sm font-semibold">{merchantName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Wallet Name</p>
            <p className="text-sm font-semibold">{walletName}</p>
          </div>
          <div>
            <div className="pb-2">
            <p className="text-xs text-muted-foreground">Phone Number</p>
            <p className="text-sm font-semibold">{phone}</p>
          </div>
            <p className="text-xs text-muted-foreground">Wallet Number</p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">{walletNumber}</p>
              <button
                type="button"
                onClick={handleCopyNumber}
                className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                <Copy className="h-3 w-3" />
                Copy
              </button>
            </div>
          </div>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
            <p className="text-xs text-muted-foreground">Amount to Pay</p>
            <p className="text-lg font-bold text-primary">
              NPR {amount.toLocaleString()}
            </p>
          </div>
         
        </div>
      </div>

 {/* Transaction ID */}
          <div className="space-y-3">
            <label htmlFor="transactionId" className="text-sm font-medium p-2">
              Transaction ID <span className="text-red-600">*</span>
            </label>
            <Input
              id="transactionId"
              name="transactionId"
              placeholder="Enter transaction ID from your payment app"
              value={transactionId}
              onChange={(e) => onTransactionIdChange(e.target.value)}
              required
            />
            {errors.transactionId && (
              <p className="text-xs text-red-600">{errors.transactionId}</p>
            )}
          </div>
          {/* Screenshot upload */}
          <div className="space-y-2">
            <label htmlFor="paymentScreenshot" className="text-sm font-medium">
              Payment Screenshot <span className="text-red-600">*</span>
            </label>
            <label
              htmlFor="paymentScreenshot"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border p-6 text-center hover:border-primary/50 transition-colors"
            >
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {screenshot ? screenshot.name : "Click to upload a screenshot"}
              </span>
              <input
                id="paymentScreenshot"
                name="paymentScreenshot"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleScreenshotSelect}
                required
              />
            </label>
            {errors.paymentScreenshot && (
              <p className="text-xs text-red-600">{errors.paymentScreenshot}</p>
            )}
          </div>


      {/* Instructions */}
      <div className="rounded-xl border border-border bg-muted/40 p-4">
        <p className="text-sm font-semibold mb-2">Payment Instructions</p>
        <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
          <li>Scan the QR code above using your wallet app.</li>
          <li>Pay the exact amount shown.</li>
          <li>Save the Transaction ID from your payment app.</li>
          <li>Upload a screenshot of the completed payment.</li>
          <li>Click Confirm Order.</li>
          <li>Our admin will verify your payment manually.</li>
        </ol>
      </div>

      {/* Verification notice */}
      <Alert className="bg-yellow-50 border-yellow-200">
        <AlertDescription className="text-yellow-800 text-sm">
          This is a manual payment method. Your order will stay pending until
          our team verifies the transaction ID and screenshot.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default QrPayment;