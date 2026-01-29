import { useState, useEffect } from "react";
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
import { getPetsByUser, getVaccinationsByPet, createVaccination, deleteVaccination } from "@/lib/api";
import type { Pet, Vaccination } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext";

export default function Vaccinations() {
  const { user } = useAuth();
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const petsQuery = useQuery({
    queryKey: ["pets", user?.id],
    queryFn: () => getPetsByUser(user!.id),
    enabled: !!user,
  });

  const pets = petsQuery.data || [];

  // Auto-select first pet when pets are successfully loaded
  useEffect(() => {
    if (petsQuery.status === "success" && pets.length > 0 && !selectedPetId) {
      setSelectedPetId(pets[0].id);
    }
  }, [petsQuery.status, pets, selectedPetId]);

  const { data: vaccinations = [] } = useQuery({
    queryKey: ["vaccinations", selectedPetId],
    queryFn: () => getVaccinationsByPet(selectedPetId),
    enabled: !!selectedPetId,
  });

  const addVaccinationMutation = useMutation({
    mutationFn: createVaccination,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaccinations", selectedPetId] });
      toast.success("Vaccination record added");
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to add vaccination: ${error.message}`);
    },
  });

  const deleteVaccinationMutation = useMutation({
    mutationFn: deleteVaccination,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaccinations", selectedPetId] });
      toast.success("Vaccination record deleted");
    },
    onError: (error) => {
      toast.error(`Failed to delete vaccination: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Extract and validate form data
    const vaccineName = formData.get("vaccineName")?.toString().trim();
    const dateAdministered = formData.get("dateAdministered")?.toString();
    const expirationDate = formData.get("expirationDate")?.toString();
    const vetName = formData.get("vetName")?.toString().trim();
    const notes = formData.get("notes")?.toString().trim();
    const documentUrl = formData.get("documentUrl")?.toString().trim();

    // Validate required fields
    if (!vaccineName) {
      toast.error("Vaccination name is required");
      return;
    }
    if (!dateAdministered) {
      toast.error("Date administered is required");
      return;
    }
    if (!selectedPetId) {
      toast.error("Please select a pet first");
      return;
    }

    // Convert dates to ISO strings
    let dateAdministeredISO: string;
    let expirationDateISO: string | null = null;

    try {
      dateAdministeredISO = new Date(dateAdministered).toISOString();
    } catch (error) {
      toast.error("Invalid date administered");
      return;
    }

    if (expirationDate) {
      try {
        expirationDateISO = new Date(expirationDate).toISOString();
      } catch (error) {
        toast.error("Invalid expiration date");
        return;
      }
    }

    // Submit with proper types
    addVaccinationMutation.mutate({
      petId: selectedPetId,
      vaccineName,
      dateAdministered: dateAdministeredISO,
      expirationDate: expirationDateISO,
      vetName: vetName || null,
      notes: notes || null,
      documentUrl: documentUrl || null,
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

  // Loading state
  if (!user || petsQuery.isLoading) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading vaccination records...</p>
          </div>
        </div>
      </PortalLayout>
    );
  }

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

        {pets.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">No pets found. Please add a pet first.</p>
            </CardContent>
          </Card>
        ) : (
          <>
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
          </>
        )}

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
