import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface UploadPortfolioProps {
  onSuccess: () => void;
}

export function UploadPortfolio({ onSuccess }: UploadPortfolioProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const categories = useQuery(api.categories.list) || [];
  const generateUploadUrl = useMutation(api.portfolios.generateUploadUrl);
  const createPortfolio = useMutation(api.portfolios.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !category || files.length === 0) {
      toast.error("Please fill in all required fields and upload at least one file");
      return;
    }

    setIsUploading(true);
    try {
      // Upload thumbnail if provided
      let thumbnailId;
      if (thumbnailFile) {
        const thumbnailUploadUrl = await generateUploadUrl();
        const thumbnailResult = await fetch(thumbnailUploadUrl, {
          method: "POST",
          headers: { "Content-Type": thumbnailFile.type },
          body: thumbnailFile,
        });
        const thumbnailJson = await thumbnailResult.json();
        if (!thumbnailResult.ok) {
          throw new Error(`Thumbnail upload failed: ${JSON.stringify(thumbnailJson)}`);
        }
        thumbnailId = thumbnailJson.storageId;
      }

      // Upload all files
      const fileIds = [];
      for (const file of files) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const json = await result.json();
        if (!result.ok) {
          throw new Error(`File upload failed: ${JSON.stringify(json)}`);
        }
        fileIds.push(json.storageId);
      }

      // Create portfolio
      await createPortfolio({
        title: title.trim(),
        description: description.trim(),
        category,
        tags: tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0),
        thumbnailId,
        fileIds,
      });

      toast.success("Portfolio uploaded successfully!");
      onSuccess();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload portfolio. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnailFile(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Upload Your Portfolio</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your portfolio title"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe your portfolio and the work you've done"
            required
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter tags separated by commas (e.g., modern, minimalist, responsive)"
          />
        </div>

        <div>
          <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-2">
            Thumbnail Image
          </label>
          <input
            type="file"
            id="thumbnail"
            onChange={handleThumbnailChange}
            accept="image/*"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            Upload a preview image for your portfolio (recommended)
          </p>
        </div>

        <div>
          <label htmlFor="files" className="block text-sm font-medium text-gray-700 mb-2">
            Portfolio Files *
          </label>
          <input
            type="file"
            id="files"
            onChange={handleFileChange}
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Upload your portfolio files (images, videos, documents). You can select multiple files.
          </p>
          {files.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700">Selected files:</p>
              <ul className="text-sm text-gray-600">
                {files.map((file, index) => (
                  <li key={index}>• {file.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isUploading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? "Uploading..." : "Upload Portfolio"}
          </button>
          <button
            type="button"
            onClick={onSuccess}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
