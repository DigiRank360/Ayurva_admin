import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bannerAPI } from '@/lib/bannerAPI';
import { useToast } from '@/components/ui/use-toast';

// Fetch all banners
export const useBanners = () => {
    return useQuery({
        queryKey: ['banners'],
        queryFn: bannerAPI.getAll,
    });
};

// Fetch single banner
export const useBanner = (id) => {
    return useQuery({
        queryKey: ['banner', id],
        queryFn: () => bannerAPI.getById(id),
        enabled: !!id,
    });
};

// Create banner mutation
export const useCreateBanner = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: bannerAPI.create,
        onSuccess: () => {
            queryClient.invalidateQueries(['banners']);
            toast({
                title: 'Success',
                description: 'Banner created successfully',
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to create banner',
                variant: 'destructive',
            });
        },
    });
};

// Update banner mutation
export const useUpdateBanner = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ id, data }) => bannerAPI.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['banners']);
            toast({
                title: 'Success',
                description: 'Banner updated successfully',
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update banner',
                variant: 'destructive',
            });
        },
    });
};

// Delete banner mutation
export const useDeleteBanner = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: bannerAPI.delete,
        onSuccess: () => {
            queryClient.invalidateQueries(['banners']);
            toast({
                title: 'Success',
                description: 'Banner deleted successfully',
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete banner',
                variant: 'destructive',
            });
        },
    });
};

// Toggle banner status mutation
export const useToggleBanner = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: bannerAPI.toggle,
        onSuccess: () => {
            queryClient.invalidateQueries(['banners']);
            toast({
                title: 'Success',
                description: 'Banner status updated',
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update status',
                variant: 'destructive',
            });
        },
    });
};
