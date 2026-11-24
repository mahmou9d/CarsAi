// @ts-nocheck
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, X, Upload, Save, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { updateCar } from "@/actions/cars";
import useFetch from "@/hooks/use-fetch";

const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid", "Plug-in Hybrid"];
const transmissions = ["Automatic", "Manual", "Semi-Automatic"];
const bodyTypes = [
  "SUV",
  "Sedan",
  "Hatchback",
  "Convertible",
  "Coupe",
  "Wagon",
  "Pickup",
];
const carStatuses = ["AVAILABLE", "UNAVAILABLE", "SOLD"];

const editCarFormSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.string().refine((val) => {
    const year = parseInt(val, 10);
    return !isNaN(year) && year >= 1900 && year <= new Date().getFullYear() + 1;
  }, "Valid year required"),
  price: z.string().min(1, "Price is required"),
  mileage: z.string().min(1, "Mileage is required"),
  color: z.string().min(1, "Color is required"),
  fuelType: z.string().min(1, "Fuel type is required"),
  transmission: z.string().min(1, "Transmission is required"),
  bodyType: z.string().min(1, "Body type is required"),
  seats: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  status: z.enum(carStatuses),
  featured: z.boolean().default(false),
});

export const EditCarForm = ({ initialCar }) => {
  const router = useRouter();

  // Keep track of existing images (URLs) and newly added image files
  const [existingImages, setExistingImages] = useState(initialCar.images || []);
  const [newImages, setNewImages] = useState([]);
  const [imageError, setImageError] = useState("");

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editCarFormSchema),
    defaultValues: {
      make: initialCar.make || "",
      model: initialCar.model || "",
      year: initialCar.year ? initialCar.year.toString() : "",
      price: initialCar.price ? initialCar.price.toString() : "",
      mileage: initialCar.mileage ? initialCar.mileage.toString() : "",
      color: initialCar.color || "",
      fuelType: initialCar.fuelType || "",
      transmission: initialCar.transmission || "",
      bodyType: initialCar.bodyType || "",
      seats: initialCar.seats ? initialCar.seats.toString() : "",
      description: initialCar.description || "",
      status: initialCar.status || "AVAILABLE",
      featured: Boolean(initialCar.featured),
    },
  });

  const {
    loading: isUpdating,
    fn: updateCarFn,
    data: updateResult,
    error: updateError,
  } = useFetch(updateCar);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      newImages.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, [newImages]);

  // Handle successful update
  useEffect(() => {
    if (updateResult?.success) {
      toast.success("Car updated successfully");
      router.push("/admin/cars");
    }
  }, [updateResult, router]);

  useEffect(() => {
    if (updateError) {
      toast.error(updateError.message || "Failed to update car");
    }
  }, [updateError]);

  // Multiple new images Dropzone
  const onDropNewImages = useCallback((acceptedFiles) => {
    const validFiles = acceptedFiles.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const mapped = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setNewImages((prev) => [...prev, ...mapped]);
    setImageError("");
    toast.success(`Added ${validFiles.length} new image(s)`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropNewImages,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    multiple: true,
  });

  const removeExistingImage = (indexToRemove) => {
    if (existingImages.length + newImages.length <= 1) {
      toast.error("A car must have at least one image");
      return;
    }
    setExistingImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const removeNewImage = (indexToRemove) => {
    setNewImages((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[indexToRemove].preview);
      updated.splice(indexToRemove, 1);
      return updated;
    });
  };

  const onSubmit = async (data) => {
    if (existingImages.length === 0 && newImages.length === 0) {
      setImageError("Please provide at least one image");
      return;
    }

    const carData = {
      ...data,
      year: parseInt(data.year, 10),
      price: parseFloat(data.price),
      mileage: parseInt(data.mileage, 10),
      seats: data.seats ? parseInt(data.seats, 10) : null,
    };

    await updateCarFn({
      id: initialCar.id,
      carData,
      existingImages,
      newImages: newImages.map((img) => img.file),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Vehicle Details */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Specify the manufacturer, model, year, and primary identification.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="make">Make</Label>
            <Input
              id="make"
              placeholder="e.g. BMW, Toyota"
              {...register("make")}
              className={errors.make ? "border-red-500" : ""}
            />
            {errors.make && (
              <p className="text-xs text-red-500">{errors.make.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              placeholder="e.g. 3 Series, Camry"
              {...register("model")}
              className={errors.model ? "border-red-500" : ""}
            />
            {errors.model && (
              <p className="text-xs text-red-500">{errors.model.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              type="number"
              placeholder="e.g. 2022"
              {...register("year")}
              className={errors.year ? "border-red-500" : ""}
            />
            {errors.year && (
              <p className="text-xs text-red-500">{errors.year.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing & Specifications</CardTitle>
          <CardDescription>
            Set the sale price, mileage, and mechanical specifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              step="any"
              placeholder="e.g. 35000"
              {...register("price")}
              className={errors.price ? "border-red-500" : ""}
            />
            {errors.price && (
              <p className="text-xs text-red-500">{errors.price.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mileage">Mileage (miles)</Label>
            <Input
              id="mileage"
              type="number"
              placeholder="e.g. 24000"
              {...register("mileage")}
              className={errors.mileage ? "border-red-500" : ""}
            />
            {errors.mileage && (
              <p className="text-xs text-red-500">{errors.mileage.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              placeholder="e.g. Black, Pearl White"
              {...register("color")}
              className={errors.color ? "border-red-500" : ""}
            />
            {errors.color && (
              <p className="text-xs text-red-500">{errors.color.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bodyType">Body Type</Label>
            <Controller
              name="bodyType"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger id="bodyType">
                    <SelectValue placeholder="Select body type" />
                  </SelectTrigger>
                  <SelectContent>
                    {bodyTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.bodyType && (
              <p className="text-xs text-red-500">{errors.bodyType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fuelType">Fuel Type</Label>
            <Controller
              name="fuelType"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger id="fuelType">
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    {fuelTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.fuelType && (
              <p className="text-xs text-red-500">{errors.fuelType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="transmission">Transmission</Label>
            <Controller
              name="transmission"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger id="transmission">
                    <SelectValue placeholder="Select transmission" />
                  </SelectTrigger>
                  <SelectContent>
                    {transmissions.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.transmission && (
              <p className="text-xs text-red-500">
                {errors.transmission.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="seats">Seats (Optional)</Label>
            <Input
              id="seats"
              type="number"
              placeholder="e.g. 5"
              {...register("seats")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Listing Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {carStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex items-center space-x-3 pt-8">
            <Controller
              name="featured"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="featured"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="featured" className="cursor-pointer font-medium">
              Featured on Homepage
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
          <CardDescription>
            Detailed vehicle overview and highlights.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={5}
            placeholder="Describe the car condition, service records, key options, and warranty status..."
            {...register("description")}
            className={errors.description ? "border-red-500" : ""}
          />
          {errors.description && (
            <p className="text-xs text-red-500 mt-1">
              {errors.description.message}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Image Gallery Management */}
      <Card>
        <CardHeader>
          <CardTitle>Image Gallery</CardTitle>
          <CardDescription>
            Manage existing images or upload new ones. High quality photos improve engagement.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {imageError && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
              {imageError}
            </div>
          )}

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-3">
                Current Images ({existingImages.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {existingImages.map((url, idx) => (
                  <div
                    key={url}
                    className="group relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-50"
                  >
                    <Image
                      src={url}
                      alt={`Car photo ${idx + 1}`}
                      fill
                      className="object-scale-down"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(idx)}
                      className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-700"
                      title="Remove image"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Newly Added Images */}
          {newImages.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-3">
                Newly Added Images ({newImages.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {newImages.map((img, idx) => (
                  <div
                    key={img.preview}
                    className="group relative aspect-video rounded-xl overflow-hidden border-2 border-dashed border-red-300 bg-slate-50"
                  >
                    <Image
                      src={img.preview}
                      alt={`New image ${idx + 1}`}
                      fill
                      className="object-scale-down"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(idx)}
                      className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-700"
                      title="Remove image"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <span className="absolute bottom-1 left-1 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                      New
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dropzone for adding more images */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-red-500 bg-red-50/50"
                : "border-slate-300 hover:border-red-400 bg-slate-50/50"
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="p-3 bg-white rounded-full shadow-sm text-red-600">
                <Upload className="h-6 w-6" />
              </div>
              <p className="font-medium text-slate-800">
                Drag & drop additional photos, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, WEBP up to 5MB each
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4">
        <Link href="/admin/cars">
          <Button variant="outline" type="button" className="rounded-full">
            Cancel
          </Button>
        </Link>
        <Button
          type="submit"
          disabled={isUpdating}
          className="rounded-full bg-[#E4141B] hover:bg-[#c81219] text-white px-8 gap-2"
        >
          {isUpdating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving Changes...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

