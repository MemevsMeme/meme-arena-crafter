
import React from 'react';
import { Button } from '@/components/ui/button';
import { Move, Save, Database } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SaveActionsProps {
  isEditMode: boolean;
  isCreatingMeme: boolean;
  isUploadingToIPFS: boolean;
  setIsEditMode: (isEditMode: boolean) => void;
  handleSaveMeme: () => void;
}

const SaveActions: React.FC<SaveActionsProps> = ({
  isEditMode,
  isCreatingMeme,
  isUploadingToIPFS,
  setIsEditMode,
  handleSaveMeme
}) => {
  const isMobile = useIsMobile();
  
  const onSaveMeme = () => {
    console.log('Save button clicked, starting meme creation process');
    handleSaveMeme();
  };

  return (
    <div className="flex gap-2 mt-4">
      <Button
        type="button"
        variant={isEditMode ? "default" : "outline"}
        onClick={() => setIsEditMode(!isEditMode)}
        className="flex-1"
        size={isMobile ? "sm" : "default"}
      >
        <Move className={`${isMobile ? '' : 'mr-2'} h-4 w-4`} />
        {!isMobile && (isEditMode ? 'Exit Edit Mode' : 'Advanced Edit')}
        {isMobile && (isEditMode ? 'Exit' : 'Edit')}
      </Button>
      
      <Button
        onClick={onSaveMeme}
        disabled={isCreatingMeme || isUploadingToIPFS}
        className="flex-1"
        size={isMobile ? "sm" : "default"}
        title="Create meme with or without text"
      >
        {isCreatingMeme ? (
          <>
            {isUploadingToIPFS ? (
              <>
                <Database className={`animate-pulse ${isMobile ? '' : 'mr-2'} h-4 w-4`} />
                {!isMobile && "Storing..."}
              </>
            ) : (
              <>{isMobile ? "Saving..." : "Creating Meme..."}</>
            )}
          </>
        ) : (
          <>
            <Save className={`${isMobile ? '' : 'mr-2'} h-4 w-4`} />
            {isMobile ? "Create" : "Create Meme"}
          </>
        )}
      </Button>
    </div>
  );
};

export default SaveActions;
