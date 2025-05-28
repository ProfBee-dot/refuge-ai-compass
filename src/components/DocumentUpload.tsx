
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Image, Shield, Download, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: Date;
  status: 'uploaded' | 'processing' | 'verified' | 'rejected';
  category: string;
}

export const DocumentUpload = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "passport_scan.pdf",
      type: "pdf",
      size: "2.4 MB",
      uploadDate: new Date('2024-01-15'),
      status: "verified",
      category: "Identity"
    },
    {
      id: "2", 
      name: "medical_records.pdf",
      type: "pdf",
      size: "1.8 MB",
      uploadDate: new Date('2024-01-12'),
      status: "processing",
      category: "Medical"
    },
    {
      id: "3",
      name: "family_photo.jpg",
      type: "image",
      size: "800 KB",
      uploadDate: new Date('2024-01-10'),
      status: "uploaded",
      category: "Personal"
    }
  ]);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const documentCategories = [
    "Identity Documents",
    "Medical Records", 
    "Education Certificates",
    "Family Documents",
    "Legal Papers",
    "Financial Records",
    "Personal Photos",
    "Other"
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800 border-green-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'uploaded': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'doc':
      case 'docx':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <Image className="w-5 h-5 text-blue-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const simulateUpload = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          
          // Add new document to list
          const newDoc: Document = {
            id: Date.now().toString(),
            name: file.name,
            type: file.name.split('.').pop() || 'unknown',
            size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
            uploadDate: new Date(),
            status: 'uploaded',
            category: 'Other'
          };
          
          setDocuments(prev => [newDoc, ...prev]);
          
          toast({
            title: "Upload Complete",
            description: `${file.name} has been uploaded successfully.`,
          });
          
          return 0;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload files smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      
      simulateUpload(file);
    }
  };

  const handleDelete = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    toast({
      title: "Document Deleted",
      description: "The document has been removed from your account.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-green-500" />
            <span>Secure Document Center</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Upload your documents securely. All files are encrypted and only accessible by authorized personnel.
          </p>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Upload Documents</h3>
            <p className="text-gray-600 mb-4">
              Drag and drop files here, or click to browse
            </p>
            
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              disabled={isUploading}
            />
            
            <Button asChild disabled={isUploading}>
              <label htmlFor="file-upload" className="cursor-pointer">
                {isUploading ? "Uploading..." : "Choose Files"}
              </label>
            </Button>
            
            <p className="text-xs text-gray-500 mt-3">
              Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
            </p>
          </div>

          {isUploading && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Uploading...</span>
                <span className="text-sm text-gray-600">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Document Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {documentCategories.map((category) => (
              <div key={category} className="p-3 border rounded-lg text-center hover:bg-gray-50 transition-colors">
                <p className="text-sm font-medium">{category}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {documents.filter(doc => doc.category === category.split(' ')[0]).length} files
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Document List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Documents ({documents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {documents.map((document) => (
              <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  {getFileIcon(document.type)}
                  <div>
                    <h4 className="font-medium">{document.name}</h4>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{document.size}</span>
                      <span>{document.uploadDate.toLocaleDateString()}</span>
                      <span>Category: {document.category}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge className={getStatusColor(document.status)}>
                    {document.status}
                  </Badge>
                  
                  <div className="flex space-x-1">
                    <Button size="sm" variant="ghost">
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleDelete(document.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900">Privacy & Security</h4>
              <p className="text-sm text-green-700 mt-1">
                Your documents are encrypted and stored securely. Only authorized personnel can access them for verification purposes. 
                You can delete any document at any time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
