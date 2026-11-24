"use client";
import { useState, useEffect } from "react";
import { Search, Upload, Camera, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { processImageSearch } from "@/actions/home";
import useFetch from "@/hooks/use-fetch";

export function HomeSearch() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchImage, setSearchImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isImageSearchActive, setIsImageSearchActive] = useState(false);

  const {
    loading: isProcessing,
    fn: processImageFn,
    data: processResult,
    error: processError,
  } = useFetch(processImageSearch);

  useEffect(() => {
    if (processResult?.success) {
      const params = new URLSearchParams();

      if (processResult.data.make) params.set("make", processResult.data.make);
      if (processResult.data.bodyType)
        params.set("bodyType", processResult.data.bodyType);
      if (processResult.data.color)
        params.set("color", processResult.data.color);

      router.push(`/cars?${params.toString()}`);
    }
  }, [processResult, router]);

  useEffect(() => {
    if (processError) {
      toast.error(
        "Failed to analyze image: " + (processError.message || "Unknown error"),
      );
    }
  }, [processError]);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      setIsUploading(true);
      setSearchImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setIsUploading(false);
        toast.success("Image uploaded successfully");
      };
      reader.onerror = () => {
        setIsUploading(false);
        toast.error("Failed to read the image");
      };
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "image/*": [".jpeg", ".jpg", ".png"],
      },
      maxFiles: 1,
    });

  // Phones: "Take a photo" opens the camera directly
  const onCapture = (e) => {
    const file = e.target.files?.[0];
    if (file) onDrop([file]);
    e.target.value = "";
  };

  const handleTextSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      toast.error("Please enter a search term");
      return;
    }

    router.push(`/cars?search=${encodeURIComponent(searchTerm)}`);
  };

  const handleImageSearch = async (e) => {
    e.preventDefault();
    if (!searchImage) {
      toast.error("Please upload an image first");
      return;
    }

    await processImageFn(searchImage);
  };

  const removeImage = () => {
    setSearchImage(null);
    setImagePreview("");
    toast.info("Image removed");
  };

  const busy = isUploading || isProcessing;

  return (
    <div className="text-black">
      {/* Text search: stacked on phones, one row from `sm` up */}
      <form
        onSubmit={handleTextSearch}
        role="search"
        className="flex flex-wrap items-center gap-2 sm:flex-nowrap"
      >
        <div className="relative w-full sm:flex-1">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
            aria-hidden="true"
          />
          <label htmlFor="home-search-input" className="sr-only">
            Search by make or model
          </label>
          {/* text-base (16px) stops iOS from zooming in when the field is focused */}
          <input
            id="home-search-input"
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            placeholder="Search make or model…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-14 w-full rounded-full bg-[#F3F1EC] pl-12 pr-4 text-base placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/50"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsImageSearchActive(!isImageSearchActive)}
          aria-expanded={isImageSearchActive}
          aria-controls="home-image-search"
          aria-label="Search by photo"
          className={`flex h-14 flex-1 items-center justify-center gap-2 rounded-full border px-5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/50 sm:size-14 sm:flex-none sm:px-0 ${
            isImageSearchActive
              ? "border-[#161213] bg-[#161213] text-white"
              : "border-black/10 bg-white text-gray-800 hover:border-black/30"
          }`}
        >
          <Camera className="h-5 w-5" aria-hidden="true" />
          <span className="sm:sr-only">Search by photo</span>
        </button>

        <button
          type="submit"
          className="flex h-14 flex-1 items-center justify-center rounded-full bg-[#E4141B] px-7 text-base font-semibold text-white transition-colors hover:bg-[#c81219] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/50 focus-visible:ring-offset-2 sm:flex-none"
        >
          Search
        </button>
      </form>

      {/* Image search */}
      {isImageSearchActive && (
        <form
          id="home-image-search"
          onSubmit={handleImageSearch}
          className="mt-3 space-y-3"
        >
          <div
            className={`rounded-3xl border-2 border-dashed p-5 text-center transition-colors ${
              isDragReject
                ? "border-amber-500 bg-amber-50"
                : isDragActive
                  ? "border-[#E4141B] bg-[#E4141B]/5"
                  : "border-black/15 bg-[#F3F1EC]"
            }`}
          >
            {imagePreview ? (
              <div className="flex flex-col items-center gap-4">
                <img
                  src={imagePreview}
                  alt="Preview of the car photo you selected"
                  className="max-h-52 w-auto max-w-full rounded-2xl object-contain"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="inline-flex h-12 items-center gap-1.5 rounded-full border border-black/15 bg-white px-5 text-sm font-semibold text-gray-800 transition-colors hover:border-black/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/50"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Remove image
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                {/* Tap to choose from gallery / drag and drop */}
                <div
                  {...getRootProps()}
                  className="w-full cursor-pointer rounded-2xl py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/50"
                >
                  <input {...getInputProps()} />
                  <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#E4141B] text-white">
                    <Upload className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <p className="mt-3 text-base font-semibold text-gray-900">
                    {isDragActive && !isDragReject
                      ? "Leave the file here to upload"
                      : "Choose a car photo"}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    <span className="hidden sm:inline">
                      Drag &amp; drop or click to select.{" "}
                    </span>
                    JPG or PNG, max 5MB
                  </p>
                  {isDragReject && (
                    <p className="mt-2 text-sm font-medium text-amber-700">
                      Invalid image type
                    </p>
                  )}
                </div>

                {/* Phones and tablets: open the camera straight away */}
                <label className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#161213] px-6 text-sm font-semibold text-white transition-colors hover:bg-black focus-within:ring-2 focus-within:ring-[#E4141B]/50 lg:hidden">
                  <Camera className="h-4 w-4" aria-hidden="true" />
                  Take a photo
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={onCapture}
                    className="sr-only"
                  />
                </label>
              </div>
            )}
          </div>

          {imagePreview && (
            <button
              type="submit"
              disabled={busy}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#E4141B] text-base font-semibold text-white transition-colors hover:bg-[#c81219] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              {isUploading
                ? "Uploading..."
                : isProcessing
                  ? "Analyzing image..."
                  : "Search with this image"}
            </button>
          )}
        </form>
      )}
    </div>
  );
}
