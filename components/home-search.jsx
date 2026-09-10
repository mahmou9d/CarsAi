"use client";
import { useState, useEffect } from "react";
import { Search, Upload, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  return (
    <div>
      <form onSubmit={handleTextSearch}>
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-5 h-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Enter make, model, or use our AI Image Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-12 py-6 w-full rounded-full border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm"
          />

          {/* Image Search Button */}
          <div className="absolute right-[100px]">
            <Camera
              size={32}
              onClick={() => setIsImageSearchActive(!isImageSearchActive)}
              className={`cursor-pointer rounded-full p-1.5 transition-colors ${
                isImageSearchActive
                  ? "bg-[#E4141B] text-white"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            />
          </div>

          <Button
            type="submit"
            className="absolute right-2 rounded-full bg-[#E4141B] hover:bg-[#c81219] text-white"
          >
            Search
          </Button>
        </div>
      </form>

      {isImageSearchActive && (
        <div className="mt-4">
          <form onSubmit={handleImageSearch} className="space-y-4">
            <div className="border-2 border-dashed border-slate-200 bg-white/60 rounded-3xl p-6 text-center transition-colors hover:border-[#E4141B]/40">
              {imagePreview ? (
                <div className="flex flex-col items-center">
                  <img
                    src={imagePreview}
                    alt="Car preview"
                    className="h-40 object-scale-down mb-4 rounded-lg"
                  />
                  <Button
                    variant="outline"
                    className="rounded-full border-slate-200"
                    onClick={() => {
                      setSearchImage(null);
                      setImagePreview("");
                      toast.info("Image removed");
                    }}
                  >
                    <X className="h-4 w-4 mr-1.5" />
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div {...getRootProps()} className="cursor-pointer">
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center">
                    <div className="p-3 rounded-full bg-red-50 mb-3">
                      <Upload className="h-8 w-8 text-[#E4141B]" />
                    </div>
                    <p className="text-slate-600 mb-2">
                      {isDragActive && !isDragReject
                        ? "Leave the file here to upload"
                        : "Drag & drop a car image or click to select"}
                    </p>
                    {isDragReject && (
                      <p className="text-amber-600 font-medium mb-2">
                        Invalid image type
                      </p>
                    )}
                    <p className="text-slate-400 text-sm">
                      Supports: JPG, PNG (max 5MB)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {imagePreview && (
              <Button
                type="submit"
                className="w-full rounded-full bg-[#E4141B] hover:bg-[#c81219] text-white"
                disabled={isUploading || isProcessing}
              >
                {isUploading
                  ? "Uploading..."
                  : isProcessing
                    ? "Analyzing image..."
                    : "Search with this Image"}
              </Button>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
