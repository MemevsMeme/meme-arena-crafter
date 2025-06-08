import { useEffect, useState } from "react";
import { Meme } from "@shared/schema";
import { cn } from "@/lib/utils";

interface WinnerModalProps {
  meme: Meme;
  isOpen: boolean;
  onClose: () => void;
  onNewBattle: () => void;
}

const WinnerModal = ({ meme, isOpen, onClose, onNewBattle }: WinnerModalProps) => {
  const [visible, setVisible] = useState(isOpen);

  useEffect(() => {
    setVisible(isOpen);
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-300">
        <div className="text-center">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-trophy-line text-4xl text-white"></i>
          </div>
          <h3 className="text-xl font-poppins font-bold mb-2">We Have a Winner!</h3>
          <p className="mb-6 text-gray-600">This meme won the battle!</p>
          
          <div className="winner-animation bg-gray-50 p-3 rounded-lg mb-6">
            <img 
              src={meme.imageUrl} 
              alt={meme.promptText}
              className="w-full h-auto rounded-lg object-cover aspect-square" 
            />
            <p className="font-medium mt-2">"{meme.promptText}"</p>
          </div>
          
          <div className="flex space-x-3 justify-center">
            <button 
              className="px-4 py-2 bg-primary text-white rounded-lg flex items-center font-medium"
              onClick={onClose}
            >
              <i className="ri-share-line mr-2"></i> Share Victory
            </button>
            <button 
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg flex items-center font-medium"
              onClick={onNewBattle}
            >
              <i className="ri-sword-line mr-2"></i> New Battle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WinnerModal;
