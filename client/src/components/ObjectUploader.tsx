import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import { DashboardModal } from "@uppy/react";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import AwsS3 from "@uppy/aws-s3";
import type { UploadResult } from "@uppy/core";
import { Button } from "@/components/ui/button";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => void;
  buttonClassName?: string;
  children: ReactNode;
}

/**
 * A file upload component that renders as a button and provides a modal interface for
 * file management.
 * 
 * Features:
 * - Renders as a customizable button that opens a file upload modal
 * - Provides a modal interface for:
 *   - File selection
 *   - File preview
 *   - Upload progress tracking
 *   - Upload status display
 * 
 * The component uses Uppy under the hood to handle all file upload functionality.
 * All file management features are automatically handled by the Uppy dashboard modal.
 * 
 * @param props - Component props
 * @param props.maxNumberOfFiles - Maximum number of files allowed to be uploaded
 *   (default: 1)
 * @param props.maxFileSize - Maximum file size in bytes (default: 10MB)
 * @param props.onGetUploadParameters - Function to get upload parameters (method and URL).
 *   Typically used to fetch a presigned URL from the backend server for direct-to-S3
 *   uploads.
 * @param props.onComplete - Callback function called when upload is complete. Typically
 *   used to make post-upload API calls to update server state and set object ACL
 *   policies.
 * @param props.buttonClassName - Optional CSS class name for the button
 * @param props.children - Content to be rendered inside the button
 */
export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760, // 10MB default
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);

  // Handle body scroll lock when modal is open - iOS Safari compatible
  useEffect(() => {
    if (showModal) {
      // Store current scroll position
      const scrollY = window.scrollY;
      
      // Lock body scroll using position fixed method (most reliable for iOS)
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      // Store scroll position for restore
      document.body.setAttribute('data-scroll-lock', scrollY.toString());
      
      return () => {
        // Restore scroll position
        const scrollPosition = parseInt(document.body.getAttribute('data-scroll-lock') || '0');
        
        document.body.style.removeProperty('position');
        document.body.style.removeProperty('top');
        document.body.style.removeProperty('left');
        document.body.style.removeProperty('right');
        document.body.style.removeProperty('width');
        document.body.style.removeProperty('overflow');
        document.body.removeAttribute('data-scroll-lock');
        
        window.scrollTo(0, scrollPosition);
      };
    }
  }, [showModal]);

  // Create Uppy instance only when modal opens
  const [uppy, setUppy] = useState<Uppy | null>(null);

  useEffect(() => {
    if (showModal && !uppy) {
      // Create Uppy instance only when needed
      const uppyInstance = new Uppy({
        restrictions: {
          maxNumberOfFiles,
          maxFileSize,
          allowedFileTypes: ['image/*'], // Only allow images for portfolio
        },
        autoProceed: false,
      });

      uppyInstance.use(AwsS3, {
        shouldUseMultipart: false,
        getUploadParameters: onGetUploadParameters,
      });

      uppyInstance.on("complete", (result) => {
        setTimeout(() => setShowModal(false), 1000); // Close after 1 second to show completion
        onComplete?.(result);
      });

      uppyInstance.on("cancel-all", () => {
        setShowModal(false);
      });

      setUppy(uppyInstance);
    }

    // Cleanup when modal closes
    if (!showModal && uppy) {
      uppy.close();
      setUppy(null);
    }
  }, [showModal, uppy, maxNumberOfFiles, maxFileSize, onGetUploadParameters, onComplete]);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div>
      <Button onClick={handleOpenModal} className={buttonClassName}>
        {children}
      </Button>

      {showModal && uppy && (
        <DashboardModal
          uppy={uppy}
          open={showModal}
          onRequestClose={handleCloseModal}
          closeModalOnClickOutside
          closeAfterFinish
          showProgressDetails
          proudlyDisplayPoweredByUppy={false}
          metaFields={[
            { id: 'title', name: 'Title', placeholder: 'Image title' },
            { id: 'description', name: 'Description', placeholder: 'Describe this image' },
          ]}
        />
      )}
    </div>
  );
}