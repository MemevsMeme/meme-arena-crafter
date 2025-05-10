
import React from 'react';
import { Button } from '@/components/ui/button';
import { Database, ExternalLink } from 'lucide-react';
import { getIpfsUrl } from '@/lib/ipfs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface MemeIpfsLinkProps {
  ipfsCid: string | undefined | null;
  showLabel?: boolean;
  className?: string;
}

const MemeIpfsLink = ({ ipfsCid, showLabel = false, className }: MemeIpfsLinkProps) => {
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
            className={cn("ml-2 px-2", className)}
          >
            <Database className="h-4 w-4" />
            {showLabel && <span className="ml-2">View on IPFS</span>}
            {showLabel && <ExternalLink className="h-3 w-3 ml-1" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>View on IPFS (decentralized storage)</p>
          <p className="text-xs text-muted-foreground mt-1">Content is permanently stored</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MemeIpfsLink;
