import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { offerAPI } from '@/lib/offerAPI';
import { useToast } from '@/components/ui/use-toast';

// Fetch all offers
export const useOffers = () => {
    return useQuery({
        queryKey: ['offers'],
        queryFn: offerAPI.getAll,
    });
};

// Fetch single offer
export const useOffer = (id) => {
    return useQuery({
        queryKey: ['offer', id],
        queryFn: () => offerAPI.getById(id),
        enabled: !!id,
    });
};

// Create offer mutation
export const useCreateOffer = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: offerAPI.create,
        onSuccess: () => {
            queryClient.invalidateQueries(['offers']);
            toast({
                title: 'Success',
                description: 'Offer created successfully',
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to create offer',
                variant: 'destructive',
            });
        },
    });
};

// Update offer mutation
export const useUpdateOffer = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ id, data }) => offerAPI.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['offers']);
            toast({
                title: 'Success',
                description: 'Offer updated successfully',
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update offer',
                variant: 'destructive',
            });
        },
    });
};

// Delete offer mutation
export const useDeleteOffer = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: offerAPI.delete,
        onSuccess: () => {
            queryClient.invalidateQueries(['offers']);
            toast({
                title: 'Success',
                description: 'Offer deleted successfully',
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete offer',
                variant: 'destructive',
            });
        },
    });
};
