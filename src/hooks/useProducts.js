import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productAPI } from '@/lib/productAPI';
import { useToast } from '@/components/ui/use-toast';

// Fetch all products
export const useProducts = (filters) => {
    return useQuery({
        queryKey: ['products', filters],
        queryFn: () => productAPI.getAll(filters),
        keepPreviousData: true,
    });
};

// Fetch single product
export const useProduct = (id) => {
    return useQuery({
        queryKey: ['product', id],
        queryFn: () => productAPI.getById(id),
        enabled: !!id,
    });
};

// Create product mutation
export const useCreateProduct = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: productAPI.create,
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            toast({
                title: 'Success',
                description: 'Product created successfully',
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to create product',
                variant: 'destructive',
            });
        },
    });
};

// Update product mutation
export const useUpdateProduct = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ id, data }) => productAPI.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            toast({
                title: 'Success',
                description: 'Product updated successfully',
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update product',
                variant: 'destructive',
            });
        },
    });
};

// Delete product mutation
export const useDeleteProduct = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: productAPI.delete,
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            toast({
                title: 'Success',
                description: 'Product deleted successfully',
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete product',
                variant: 'destructive',
            });
        },
    });
};
