"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { AlertCircle, Calendar } from "lucide-react";
import {
  Car,
  Fuel,
  Gauge,
  LocateFixed,
  Share2,
  Heart,
  MessageSquare,
  Currency,
  ArrowLeftRight,
  Printer,
  Copy,
  Check,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toggleSavedCar } from "@/actions/car-listing";
import useFetch from "@/hooks/use-fetch";
import { formatCurrency } from "@/lib/helpers";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import EmiCalculator from "./emi-calculator";
import { InquiryDialog } from "@/components/dialogs/inquiry-dialog";
import { useCompare } from "@/hooks/use-compare";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { CarCard } from "@/components/cars/car-card";
import { InspectionReportDialog } from "@/components/dialogs/inspection-dialog";
import { CarReviewsSection } from "@/components/cars/car-reviews";
import { CarLightbox } from "@/components/cars/car-lightbox";
import { DeliveryEstimator } from "@/components/cars/delivery-estimator";
import { ReserveCarDialog } from "@/components/dialogs/reserve-car-dialog";
import { CarHistoryDialog } from "@/components/dialogs/car-history-dialog";
import { WindowStickerDialog } from "@/components/dialogs/window-sticker-dialog";
import { PriceAlertDialog } from "@/components/dialogs/price-alert-dialog";
import { SimilarCarsSection } from "@/components/cars/similar-cars-section";

export function CarDetails({ car, testDriveInfo }) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(car.wishlisted);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const { isInCompare, toggleCompare } = useCompare();
  const isCompared = isInCompare(car.id);

  const { recentlyViewed, addCarToRecent } = useRecentlyViewed();

  // Track recently viewed
  useEffect(() => {
    if (car) {
      addCarToRecent(car);
    }
  }, [car, addCarToRecent]);

  const {
    loading: savingCar,
    fn: toggleSavedCarFn,
    data: toggleResult,
    error: toggleError,
  } = useFetch(toggleSavedCar);

  // Handle toggle result with useEffect
  useEffect(() => {
    if (toggleResult?.success) {
      setIsWishlisted(toggleResult.saved);
      toast.success(toggleResult.message);
    }
  }, [toggleResult]);

  // Handle errors with useEffect
  useEffect(() => {
    if (toggleError) {
      toast.error("Failed to update favorites");
    }
  }, [toggleError]);

  // Handle save car
  const handleSaveCar = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to save cars");
      router.push("/sign-in");
      return;
    }

    if (savingCar) return;

    // Use the toggleSavedCarFn from useFetch hook
    await toggleSavedCarFn(car.id);
  };

  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${car.year} ${car.make} ${car.model}`,
          text: `Check out this ${car.year} ${car.make} ${car.model} on CarsAi!`,
          url: window.location.href,
        })
        .catch((error) => {
          console.log("Error sharing", error);
          copyToClipboard();
        });
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };

  // Handle book test drive
  const handleBookTestDrive = () => {
    if (!isSignedIn) {
      toast.error("Please sign in to book a test drive");
      router.push("/sign-in");
      return;
    }
    router.push(`/test-drive/${car.id}`);
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Image Gallery */}
        <div className="w-full lg:w-7/12">
          <div
            onClick={() => car.images?.length > 0 && setLightboxOpen(true)}
            className="aspect-video rounded-2xl overflow-hidden relative mb-4 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)] group cursor-pointer"
          >
            {car.images && car.images.length > 0 ? (
              <>
                <Image
                  src={car.images[currentImageIndex]}
                  alt={`${car.year} ${car.make} ${car.model}`}
                  fill
                  className="object-scale-down group-hover:scale-105 transition-transform duration-300"
                  priority
                />
                <div className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-sm transition">
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span>View Photos ({car.images.length})</span>
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Car className="h-24 w-24 text-gray-400" />
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {car.images && car.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {car.images.map((image, index) => (
                <div
                  key={index}
                  className={`relative cursor-pointer rounded-xl h-20 w-24 flex-shrink-0 transition overflow-hidden ${
                    index === currentImageIndex
                      ? "border-2 border-[#E4141B]"
                      : "opacity-70 hover:opacity-100"
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <Image
                    src={image}
                    alt={`${car.year} ${car.make} ${car.model} - view ${
                      index + 1
                    }`}
                    fill
                    className="object-scale-down"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              className={`flex items-center justify-center gap-1.5 rounded-full text-xs ${
                isWishlisted ? "text-[#E4141B] border-[#E4141B]/40 bg-red-50/40" : ""
              }`}
              onClick={handleSaveCar}
              disabled={savingCar}
            >
              <Heart
                className={`h-4 w-4 ${isWishlisted ? "fill-[#E4141B]" : ""}`}
              />
              <span>{isWishlisted ? "Saved" : "Save"}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className={`flex items-center justify-center gap-1.5 rounded-full text-xs transition-colors ${
                isCompared
                  ? "text-white bg-[#E4141B] hover:bg-[#c81219] hover:text-white border-[#E4141B]"
                  : ""
              }`}
              onClick={() => toggleCompare(car)}
            >
              <ArrowLeftRight className="h-4 w-4" />
              <span>{isCompared ? "In Compare" : "Compare"}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex items-center justify-center gap-1.5 rounded-full text-xs"
              onClick={() => setShareDialogOpen(true)}
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex items-center justify-center gap-1.5 rounded-full text-xs"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4" />
              <span>Print</span>
            </Button>
          </div>
        </div>

        {/* Car Details */}
        <div className="w-full lg:w-5/12">
          <div className="flex items-center justify-between">
            <Badge className="mb-2 rounded-full bg-[#E4141B] hover:bg-[#E4141B]">
              {car.bodyType}
            </Badge>
          </div>

          <h1 className="text-4xl font-bold mb-1">
            {car.year} {car.make} {car.model}
          </h1>

          <div className="text-2xl font-bold text-[#E4141B]">
            {formatCurrency(car.price)}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-6">
            <div className="flex items-center gap-2">
              <Gauge className="text-gray-500 h-5 w-5" />
              <span>{car.mileage.toLocaleString()} miles</span>
            </div>
            <div className="flex items-center gap-2">
              <Fuel className="text-gray-500 h-5 w-5" />
              <span>{car.fuelType}</span>
            </div>
            <div className="flex items-center gap-2">
              <Car className="text-gray-500 h-5 w-5" />
              <span>{car.transmission}</span>
            </div>
          </div>

          <Dialog>
            <DialogTrigger className="w-full text-start">
              <Card className="pt-5 rounded-2xl border-0 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_35px_-15px_rgba(0,0,0,0.25)] transition-shadow">
                <CardContent>
                  <div className="flex items-center gap-2 text-lg font-medium mb-2">
                    <Currency className="h-5 w-5 text-[#E4141B]" />
                    <h3>EMI Calculator</h3>
                  </div>
                  <div className="text-sm text-gray-600">
                    Estimated Monthly Payment:{" "}
                    <span className="font-bold text-gray-900">
                      {formatCurrency(car.price / 60)}
                    </span>{" "}
                    for 60 months
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    *Based on $0 down payment and 4.5% interest rate
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>CarsAi Car Loan Calculator</DialogTitle>
                <EmiCalculator price={car.price} />
              </DialogHeader>
            </DialogContent>
          </Dialog>

          {/* 150-Point Certified Inspection & Vehicle History */}
          <div className="my-4 space-y-2.5">
            <InspectionReportDialog car={car} />
            <CarHistoryDialog car={car} />
          </div>

          {/* Window Sticker + Price Alert */}
          <div className="grid grid-cols-2 gap-2 my-3">
            <WindowStickerDialog car={car} />
            <PriceAlertDialog car={car} />
          </div>

          {/* Request More Info */}
          <Card className="my-6 rounded-2xl border-0 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.2)]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-lg font-medium mb-2">
                <MessageSquare className="h-5 w-5 text-[#E4141B]" />
                <h3>Have Questions?</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Our representatives are available to answer all your queries
                about this vehicle.
              </p>
              <InquiryDialog car={car} />
            </CardContent>
          </Card>

          {(car.status === "SOLD" || car.status === "UNAVAILABLE") && (
            <Alert variant="destructive" className="rounded-2xl">
              <AlertTitle className="capitalize">
                This car is {car.status.toLowerCase()}
              </AlertTitle>
              <AlertDescription>Please check again later.</AlertDescription>
            </Alert>
          )}

          {/* Primary Action Buttons: Hold with Deposit & Test Drive */}
          {car.status !== "SOLD" && car.status !== "UNAVAILABLE" && (
            <div className="space-y-2.5">
              <ReserveCarDialog car={car} />
              <Button
                variant="outline"
                className="w-full py-6 text-base font-bold rounded-full border-slate-300 hover:border-[#E4141B] hover:text-[#E4141B] text-slate-800"
                onClick={handleBookTestDrive}
                disabled={testDriveInfo.userTestDrive}
              >
                <Calendar className="mr-2 h-5 w-5 text-[#E4141B]" />
                {testDriveInfo.userTestDrive
                  ? `Booked for ${format(
                      new Date(testDriveInfo.userTestDrive.bookingDate),
                      "EEEE, MMMM d, yyyy",
                    )}`
                  : "Schedule Free Test Drive"}
              </Button>
            </div>
          )}

          {/* Nationwide Home Delivery Estimator */}
          <div className="mt-4">
            <DeliveryEstimator />
          </div>
        </div>
      </div>

      {/* Details & Features Section */}
      <div className="mt-12 p-6 bg-white rounded-2xl shadow-[0_10px_30px_-15px_rgba(0,0,0,0.15)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-6">Description</h3>
            <p className="whitespace-pre-line text-gray-700">
              {car.description}
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-6">Features</h3>
            <ul className="grid grid-cols-1 gap-2">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 bg-[#E4141B] rounded-full"></span>
                {car.transmission} Transmission
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 bg-[#E4141B] rounded-full"></span>
                {car.fuelType} Engine
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 bg-[#E4141B] rounded-full"></span>
                {car.bodyType} Body Style
              </li>
              {car.seats && (
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-[#E4141B] rounded-full"></span>
                  {car.seats} Seats
                </li>
              )}
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 bg-[#E4141B] rounded-full"></span>
                {car.color} Exterior
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Specifications Section */}
      <div className="mt-8 p-6 bg-white rounded-2xl shadow-[0_10px_30px_-15px_rgba(0,0,0,0.15)]">
        <h2 className="text-2xl font-bold mb-6">Specifications</h2>
        <div className="bg-[#F7F7F7] rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            <div className="flex justify-between py-2 border-b border-black/10">
              <span className="text-gray-600">Make</span>
              <span className="font-medium">{car.make}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-black/10">
              <span className="text-gray-600">Model</span>
              <span className="font-medium">{car.model}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-black/10">
              <span className="text-gray-600">Year</span>
              <span className="font-medium">{car.year}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-black/10">
              <span className="text-gray-600">Body Type</span>
              <span className="font-medium">{car.bodyType}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-black/10">
              <span className="text-gray-600">Fuel Type</span>
              <span className="font-medium">{car.fuelType}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-black/10">
              <span className="text-gray-600">Transmission</span>
              <span className="font-medium">{car.transmission}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-black/10">
              <span className="text-gray-600">Mileage</span>
              <span className="font-medium">
                {car.mileage.toLocaleString()} miles
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-black/10">
              <span className="text-gray-600">Color</span>
              <span className="font-medium">{car.color}</span>
            </div>
            {car.seats && (
              <div className="flex justify-between py-2 border-b border-black/10">
                <span className="text-gray-600">Seats</span>
                <span className="font-medium">{car.seats}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dealership Location Section */}
      <div className="mt-8 p-6 bg-white rounded-2xl shadow-[0_10px_30px_-15px_rgba(0,0,0,0.15)]">
        <h2 className="text-2xl font-bold mb-6">Dealership Location</h2>
        <div className="bg-[#F7F7F7] rounded-2xl p-6">
          <div className="flex flex-col md:flex-row gap-6 justify-between">
            {/* Dealership Name and Address */}
            <div className="flex items-start gap-3">
              <LocateFixed className="h-5 w-5 text-[#E4141B] mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium">CarsAi Motors</h4>
                <p className="text-gray-600">
                  {testDriveInfo.dealership?.address || "Not Available"}
                </p>
                <p className="text-gray-600 mt-1">
                  Phone: {testDriveInfo.dealership?.phone || "Not Available"}
                </p>
                <p className="text-gray-600">
                  Email: {testDriveInfo.dealership?.email || "Not Available"}
                </p>
              </div>
            </div>

            {/* Working Hours */}
            <div className="md:w-1/2 lg:w-1/3">
              <h4 className="font-medium mb-2">Working Hours</h4>
              <div className="space-y-2">
                {testDriveInfo.dealership?.workingHours
                  ? testDriveInfo.dealership.workingHours
                      .sort((a, b) => {
                        const days = [
                          "MONDAY",
                          "TUESDAY",
                          "WEDNESDAY",
                          "THURSDAY",
                          "FRIDAY",
                          "SATURDAY",
                          "SUNDAY",
                        ];
                        return (
                          days.indexOf(a.dayOfWeek) - days.indexOf(b.dayOfWeek)
                        );
                      })
                      .map((day) => (
                        <div
                          key={day.dayOfWeek}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-600">
                            {day.dayOfWeek.charAt(0) +
                              day.dayOfWeek.slice(1).toLowerCase()}
                          </span>
                          <span>
                            {day.isOpen
                              ? `${day.openTime} - ${day.closeTime}`
                              : "Closed"}
                          </span>
                        </div>
                      ))
                  : // Default hours if none provided
                    [
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ].map((day, index) => (
                      <div key={day} className="flex justify-between text-sm">
                        <span className="text-gray-600">{day}</span>
                        <span>
                          {index < 5
                            ? "9:00 - 18:00"
                            : index === 5
                              ? "10:00 - 16:00"
                              : "Closed"}
                        </span>
                      </div>
                    ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Ratings */}
      <CarReviewsSection car={car} />

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share this car</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 border rounded-full p-1.5 pl-4 bg-slate-50">
              <span className="text-xs text-slate-600 truncate flex-1">
                {typeof window !== "undefined" ? window.location.href : ""}
              </span>
              <Button
                size="sm"
                className="rounded-full bg-[#E4141B] hover:bg-[#c81219] text-white text-xs gap-1"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopied(true);
                  toast.success("Link copied!");
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy Link"}
              </Button>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full gap-2 text-xs"
                onClick={() => {
                  const url = encodeURIComponent(window.location.href);
                  const text = encodeURIComponent(`Check out this ${car.year} ${car.make} ${car.model} on CarsAi!`);
                  window.open(`https://api.whatsapp.com/send?text=${text}%20${url}`, "_blank");
                }}
              >
                WhatsApp
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full gap-2 text-xs"
                onClick={() => {
                  const url = encodeURIComponent(window.location.href);
                  const text = encodeURIComponent(`Check out this ${car.year} ${car.make} ${car.model} on CarsAi!`);
                  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
                }}
              >
                X (Twitter)
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full gap-2 text-xs"
                onClick={() => {
                  const url = encodeURIComponent(window.location.href);
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
                }}
              >
                Facebook
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recently Viewed Cars */}
      {recentlyViewed.filter((c) => c.id !== car.id).length > 0 && (
        <div className="mt-14 pt-8 border-t border-slate-200">
          <div className="flex justify-between items-baseline mb-6">
            <h2 className="text-2xl font-bold">
              Recently <span className="text-[#E4141B]">Viewed</span>
            </h2>
            <Link
              href="/cars"
              className="text-sm font-semibold text-[#E4141B] hover:underline"
            >
              Browse more
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentlyViewed
              .filter((c) => c.id !== car.id)
              .slice(0, 4)
              .map((recentCar) => (
                <CarCard key={recentCar.id} car={recentCar} />
              ))}
          </div>
        </div>
      )}

      {/* Full-Screen Car Photo Lightbox & 360 Tour */}
      <CarLightbox
        images={car.images || []}
        initialIndex={currentImageIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        carTitle={`${car.year} ${car.make} ${car.model}`}
      />

      {/* Similar Cars Recommendation */}
      <SimilarCarsSection car={car} />
    </div>
  );
}
