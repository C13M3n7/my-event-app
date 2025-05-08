export type User = {
  id: string;
  email: string;
  role: 'Super Admin' | 'Non Admin';
  uid: string;
};

export type RoleOption = 'Super Admin' | 'Non Admin';

// Remove these old types
// export type AddAdminRoleFn = (params: { email: string }) => Promise<{ data: { success: boolean; message: string } }>;
// export type RemoveAdminRoleFn = (params: { uid: string }) => Promise<{ data: { success: boolean; message: string } }>;

// Add these new types if needed
export type CreateAdminUserFn = (params: { email: string }) => Promise<{ 
  data: { 
    success: boolean; 
    message: string; 
    uid: string 
  } 
}>;

export type ManageAdminRoleFn = (params: { 
  email?: string; 
  uid?: string; 
  action: 'promote' | 'demote'
}) => Promise<{ 
  data: { 
    success: boolean; 
    message: string 
  } 
}>;