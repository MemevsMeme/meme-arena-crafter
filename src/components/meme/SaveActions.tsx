
import React from 'react';
import { Button } from '@/components/ui/button';
import { Move, Save, Database } from 'lucide-react';

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
      >
        <Move className="mr-2 h-4 w-4" />
        {isEditMode ? 'Exit Edit Mode' : 'Advanced Edit'}
      </Button>
      
      <Button
        onClick={onSaveMeme}
        disabled={isCreatingMeme || isUploadingToIPFS}
        className="flex-1"
        title="Create meme with or without text"
      >
        {isCreatingMeme ? (
          <>
            {isUploadingToIPFS ? (
              <>
                <Database className="animate-pulse mr-2 h-4 w-4" />
                Storing on IPFS...
              </>
            ) : (
              <>Saving...</>
            )}
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Create Meme
          </>
        )}
      </Button>
    </div>
  );
};

export default SaveActions;
