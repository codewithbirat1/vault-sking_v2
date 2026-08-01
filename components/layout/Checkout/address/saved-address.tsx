import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash2 } from "lucide-react";

interface SavedAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  province:string;
  city: string;
  district: string;
  zipCode: string;
}

const SavedAddress = ({
  mockSavedAddresses,
  handleSelectAddress,
  handleAddNewAddress,
  handleDeleteAddress,
  selectedAddressId,
}: {
  mockSavedAddresses: SavedAddress[];
  handleSelectAddress: (addr: SavedAddress) => void;
  handleAddNewAddress: () => void;
  handleDeleteAddress: (id: string) => void;
  selectedAddressId: string | null;
}) => {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Saved Addresses</p>
      <RadioGroup
        value={selectedAddressId ?? ""}
        onValueChange={(val) => {
          const addr = mockSavedAddresses.find((a) => a.id === val);
          if (addr) handleSelectAddress(addr);
        }}
        className="space-y-2"
      >
        {mockSavedAddresses.map((addr) => (
          <div
            key={addr.id}
            onClick={() => handleSelectAddress(addr)}
            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedAddressId === addr.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="flex items-start gap-3">
              <RadioGroupItem
                value={addr.id}
                aria-checked={selectedAddressId === addr.id}
              />
              <div className="flex-1">
                <p className="text-sm font-semibold">{addr.label}</p>
                <p className="text-xs text-muted-foreground">
                  {addr.fullName} • {addr.phone}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {addr.address}
                </p>
                <p className="text-xs text-muted-foreground">
                  {addr.city},{" "}
                  {addr.province},{" "}
                  {addr.district.charAt(0).toUpperCase() +
                    addr.district.slice(1)}{" "}
                  {addr.zipCode}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation(); // prevent selecting the address
                  handleDeleteAddress(addr.id);
                }}
                className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Delete address"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </RadioGroup>
      <Button
        type="button"
        variant="outline"
        onClick={handleAddNewAddress}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add New Address
      </Button>
    </div>
  );
};

export default SavedAddress;
