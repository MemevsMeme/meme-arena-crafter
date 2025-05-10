
import React from 'react';
import { Button } from '@/components/ui/button';
import { Database } from 'lucide-react';
import { getIpfsUrl } from '@/lib/ipfs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MemeIpfsLinkProps {
  ipfsCid: string | undefined | null;
}

const MemeIpfsLink = ({ ipfsCid }: MemeIpfsLinkProps) => {
  if (!ipfsCid) return null;
  
  const ipfsUrl = getIpfsUrl(ipfsCid);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(ipfsUrl, '_blank')}
            className="ml-2 px-2"
          >
            <Database className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>View on IPFS (decentralized storage)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MemeIpfsLink;
