import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import categoryAPI from '@/lib/categoryAPI';
import { useToast } from '@/components/ui/use-toast';

// Fetch all categories
export const useCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: categoryAPI.getAll,
    });
};

// Fetch single category
export const useCategory = (id) => {
    return useQuery({
        queryKey: ['category', id],
        queryFn: () => categoryAPI.getById(id),
        enabled: !!id,
    });
};

// Create category mutation
export const useCreateCategory = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: categoryAPI.create,
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
            toast({
                title: 'Success',
                description: 'Category created successfully',
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to create category',
                variant: 'destructive',
            });
        },
    });
};

// Update category mutation
export const useUpdateCategory = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ id, data }) => categoryAPI.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
            toast({
                title: 'Success',
                description: 'Category updated successfully',
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update category',
                variant: 'destructive',
            });
        },
    });
};

// Delete category mutation
export const useDeleteCategory = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: categoryAPI.delete,
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
            toast({
                title: 'Success',
                description: 'Category deleted successfully',
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete category',
                variant: 'destructive',
            });
        },
    });
};
