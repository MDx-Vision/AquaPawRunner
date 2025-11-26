import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PortalLayout } from "./layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, FileText, AlertCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const MOCK_USER_ID = "user-1";

interface Pet {
  id: string;
  name: string;
  breed: string;
}

interface Vaccination {
  id: string;
  petId: string;
  vaccineName: string;
  dateAdministered: string;
  expirationDate: string | null;
  documentUrl: string | null;
  vetName: string | null;
  notes: string | null;
}

export default function Vaccinations() {
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: pets = [] } = useQuery<Pet[]>({
    queryKey: [`/api/users/${MOCK_USER_ID}/pets`],
  });

  const { data: vaccinations = [] } = useQuery<Vaccination[]>({
    queryKey: [`/api/pets/${selectedPetId}/vaccinations`],
    enabled: !!selectedPetId,
  });

  const addVaccinationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/vaccinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to add vaccination");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/pets/${selectedPetId}/vaccinations`] });
      toast.success("Vaccination record added");
      setIsAddDialogOpen(false);
    },
  });

  const deleteVaccinationMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/vaccinations/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete vaccination");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/pets/${selectedPetId}/vaccinations`] });
      toast.success("Vaccination record deleted");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    addVaccinationMutation.mutate({
      petId: selectedPetId,
      vaccineName: formData.get("vaccineName"),
      dateAdministered: new Date(formData.get("dateAdministered") as string).toISOString(),
      expirationDate: formData.get("expirationDate") 
        ? new Date(formData.get("expirationDate") as string).toISOString() 
        : null,
      vetName: formData.get("vetName") || null,
      notes: formData.get("notes") || null,
      documentUrl: formData.get("documentUrl") || null,
    });
  };

  const isExpiringSoon = (expirationDate: string | null) => {
    if (!expirationDate) return false;
    const exp = new Date(expirationDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return exp < thirtyDaysFromNow && exp > new Date();
  };

  const isExpired = (expirationDate: string | null) => {
    if (!expirationDate) return false;
    return new Date(expirationDate) < new Date();
  };

  return (
    <PortalLayout>
      <div className="max-w-6xl mx-auto space-y-8" data-testid="vaccinations-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900" data-testid="heading-vaccinations">
              Vaccination Records
            </h1>
            <p className="text-gray-600 mt-2">
              Track your pets' vaccination history and receive expiration alerts
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select a Pet</CardTitle>
            <CardDescription>Choose which pet's vaccination records to view</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pets.map((pet) => (
                <button
                  key={pet.id}
                  onClick={() => setSelectedPetId(pet.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedPetId === pet.id
                      ? "border-[#00CED1] bg-cyan-50"
                      : "border-gray-200 hover:border-[#00CED1]/50"
                  }`}
                  data-testid={`pet-card-${pet.id}`}
                >
                  <h3 className="font-semibold text-lg">{pet.name}</h3>
                  <p className="text-sm text-gray-600">{pet.breed}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedPetId && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {pets.find((p) => p.id === selectedPetId)?.name}'s Vaccinations
              </h2>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-vaccination">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Vaccination
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Vaccination Record</DialogTitle>
                    <DialogDescription>
                      Add a new vaccination record for {pets.find((p) => p.id === selectedPetId)?.name}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="vaccineName">Vaccine Name *</Label>
                      <Input
                        id="vaccineName"
                        name="vaccineName"
                        placeholder="e.g., Rabies, DHPP, Bordetella"
                        required
                        data-testid="input-vaccine-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateAdministered">Date Administered *</Label>
                      <Input
                        id="dateAdministered"
                        name="dateAdministered"
                        type="date"
                        required
                        data-testid="input-date-administered"
                      />
                    </div>
                    <div>
                      <Label htmlFor="expirationDate">Expiration Date</Label>
                      <Input
                        id="expirationDate"
                        name="expirationDate"
                        type="date"
                        data-testid="input-expiration-date"
                      />
                    </div>
                    <div>
                      <Label htmlFor="vetName">Veterinarian Name</Label>
                      <Input
                        id="vetName"
                        name="vetName"
                        placeholder="Dr. Smith"
                        data-testid="input-vet-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="documentUrl">Document URL</Label>
                      <Input
                        id="documentUrl"
                        name="documentUrl"
                        type="url"
                        placeholder="https://example.com/document.pdf"
                        data-testid="input-document-url"
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        placeholder="Any additional notes..."
                        data-testid="input-notes"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(false)}
                        data-testid="button-cancel"
                      >
                        Cancel
                      </Button>
                      <Button type="submit" data-testid="button-save">
                        Save Vaccination
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {vaccinations.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-gray-500">
                      No vaccination records found. Add one to get started.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                vaccinations.map((vaccination) => (
                  <Card
                    key={vaccination.id}
                    className={`${
                      isExpired(vaccination.expirationDate)
                        ? "border-red-300 bg-red-50"
                        : isExpiringSoon(vaccination.expirationDate)
                        ? "border-orange-300 bg-orange-50"
                        : ""
                    }`}
                    data-testid={`vaccination-card-${vaccination.id}`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold" data-testid={`text-vaccine-name-${vaccination.id}`}>
                              {vaccination.vaccineName}
                            </h3>
                            {isExpired(vaccination.expirationDate) && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <AlertCircle className="h-3 w-3" />
                                Expired
                              </span>
                            )}
                            {isExpiringSoon(vaccination.expirationDate) && !isExpired(vaccination.expirationDate) && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                <AlertCircle className="h-3 w-3" />
                                Expiring Soon
                              </span>
                            )}
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600">Administered:</span>
                              <span className="ml-2 font-medium">
                                {format(new Date(vaccination.dateAdministered), "MMM dd, yyyy")}
                              </span>
                            </div>
                            {vaccination.expirationDate && (
                              <div>
                                <span className="text-gray-600">Expires:</span>
                                <span className="ml-2 font-medium">
                                  {format(new Date(vaccination.expirationDate), "MMM dd, yyyy")}
                                </span>
                              </div>
                            )}
                            {vaccination.vetName && (
                              <div>
                                <span className="text-gray-600">Vet:</span>
                                <span className="ml-2 font-medium">{vaccination.vetName}</span>
                              </div>
                            )}
                          </div>
                          {vaccination.notes && (
                            <p className="mt-2 text-sm text-gray-600">{vaccination.notes}</p>
                          )}
                          {vaccination.documentUrl && (
                            <a
                              href={vaccination.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center gap-1 text-sm text-[#00CED1] hover:underline"
                              data-testid={`link-document-${vaccination.id}`}
                            >
                              <FileText className="h-4 w-4" />
                              View Document
                            </a>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteVaccinationMutation.mutate(vaccination.id)}
                          data-testid={`button-delete-${vaccination.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
