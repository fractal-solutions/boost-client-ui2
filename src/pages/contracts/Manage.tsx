import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Filter, MoreVertical, Eye, Edit2, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { smartcron_ip, users_ip } from '@/lib/config';

interface UserDetails {
  username?: string;
  phoneNumber: string;
  publicKey: string;
}

interface Contract {
  totalPaid: any;
  interval: number | null;
  contractId: string;
  title: string;
  creator: {
    publicKey: string;
  };
  participants: Array<{
    publicKey: string;
    type: string;
  }>;
  amount: number;
  startDate: number;
  endDate: number;
  status: 'ACTIVE' | 'PENDING' | 'COMPLETED' | 'TERMINATED';
  type: 'RECURRING_PAYMENT' | 'FIXED_PAYMENT' | 'MILESTONE_PAYMENT';
  nextPaymentDate?: number;
  participantDetails?: UserDetails[];
}

export default function ContractsManage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUserDetails = async (publicKey: string): Promise<UserDetails | null> => {
    try {
      const response = await fetch(`${users_ip}/user/by-public-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKey })
      });

      const data = await response.json();
      if (data.success) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchContracts = async () => {
      if (!user?.publicKey) return;

      try {
        const response = await fetch(
          `${smartcron_ip}/contracts/user/${encodeURIComponent(user.publicKey)}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            credentials: 'include'
          }
        );

        if (!response.ok) throw new Error('Failed to fetch contracts');

        const data = await response.json();
        
        // Fetch user details for each contract's participants
        const contractsWithDetails = await Promise.all(
          data.contracts.map(async (contract: Contract) => {
            const participantDetails = await Promise.all(
              contract.participants.map(participant => 
                fetchUserDetails(participant.publicKey)
              )
            );
            return {
              ...contract,
              participantDetails: participantDetails.filter(Boolean)
            };
          })
        );

        setContracts(contractsWithDetails);
      } catch (error) {
        console.error('Failed to fetch contracts:', error);
        toast.error('Failed to load contracts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContracts();
  }, [user?.publicKey, token]);

  useEffect(() => {
    console.log('Contracts updated:', contracts);
  }, [contracts]);

  const handleDeleteContract = async (contractId: string) => {
    try {
      const response = await fetch(`${smartcron_ip}/contract/${contractId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete contract');

      const data = await response.json();
      if (data.success) {
        setContracts(contracts.filter((c) => c.contractId !== contractId));
        toast.success('Contract deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete contract:', error);
      toast.error('Failed to delete contract');
    }
  };

  const filteredContracts = contracts.filter((contract) =>
    contract.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user?.publicKey) {
    return (
      <div className="container mx-auto max-w-7xl">
        <Card className="p-8 text-center">
          <CardContent>
            <div className="space-y-4">
              <Edit2 className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-medium">Login Required</h3>
              <p className="text-muted-foreground">
                Please login to manage Contracts
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search contracts..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button 
            className="bg-gradient-to-r from-primary to-primary/80"
            onClick={() => navigate('/contracts/create')}
          >
            New Contract
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  {/*<TableHead>Title</TableHead>*/}
                  <TableHead>Client</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Next Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Interval</TableHead>
                  <TableHead>Paid Out</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => (
                  <TableRow key={contract.contractId}>
                    {/*<TableCell className="font-medium">{contract.title}</TableCell>*/}
                    <TableCell>
                      {contract.participantDetails?.[0] ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {contract.participantDetails[0].username ? 
                              `@${contract.participantDetails[0].username}` : 
                              contract.participantDetails[0].phoneNumber}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {contract.participantDetails[0].phoneNumber}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          {contract.creator.publicKey.slice(0, 8)}...
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{contract.amount}</TableCell>
                    <TableCell>
                      {contract.nextPaymentDate && ( new Date(contract.endDate) > new Date(contract.nextPaymentDate)) 
                        ? new Date(contract.nextPaymentDate).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {contract.endDate < contract.startDate
                        ? new Date(contract.startDate).toLocaleDateString()
                        : new Date(contract.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {contract.interval ? (
                        (() => {
                          const interval = Number(contract.interval);
                          const weeks = Math.floor(interval / (1000 * 60 * 60 * 24 * 7));
                          const days = Math.floor((interval % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24));
                          const hours = Math.floor((interval % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                          const minutes = Math.floor((interval % (1000 * 60 * 60)) / (1000 * 60));

                          return (
                            (weeks ? weeks === 1 ? '1 week ' : `${weeks} weeks ` : '') +
                            (days ? days === 1 ? '1 day ' : `${days} days ` : '') +
                            (hours ? hours === 1 ? '1 hour ' : `${hours} hours ` : '') +
                            (minutes ? minutes === 1 ? '1 minute ' : `${minutes} minutes` : '')
                          );
                        })()
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {contract.totalPaid 
                        ? (contract.totalPaid + contract.amount).toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'KES'
                          })
                        : (contract.amount).toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'KES'
                          })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          contract.status === 'ACTIVE' && contract.type === 'RECURRING_PAYMENT'
                            ? 'default'
                            : contract.status === 'PENDING'
                            ? 'secondary'
                            : 'outline'
                        }
                        className='pb-1 mb-1'
                      >
                        {contract.type === 'FIXED_PAYMENT'? 'DONE' : contract.status}
                      </Badge>
                      <br />
                      <Badge
                        variant={
                          contract.type === 'RECURRING_PAYMENT'
                            ? 'default'
                            : contract.type === 'FIXED_PAYMENT'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {contract.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="secondary" size="icon" className='bg-red-700 hover:bg-red-400'>
                            <Edit2 className="h-4 w-4" />
                            Edit
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Edit Contract
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteContract(contract.contractId)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Contract
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}