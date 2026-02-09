# Frontend Integration Examples

## Updated Auth Context Usage

### Example 1: Protecting Admin-Only Features

**Before** (problematic):
```tsx
const Dashboard = () => {
  const { user } = useMongoAuth();
  
  // This would show admin UI even for unapproved admins!
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }
  return <UserDashboard />;
};
```

**After** (correct):
```tsx
const Dashboard = () => {
  const { isAdminApproved } = useMongoAuth();
  
  // Only show admin features if approved
  if (isAdminApproved) {
    return <AdminDashboard />;
  }
  return <UserDashboard />;
};
```

---

## Example 2: Updated Auth Page with Role Selection

The current Auth.tsx component can be enhanced to let users choose their role during signup:

```tsx
const [selectedRole, setSelectedRole] = useState<'admin' | 'user'>('user');

// In the form:
{isSignUp && (
  <>
    <div className="space-y-2">
      <Label>Account Type</Label>
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant={selectedRole === 'user' ? 'default' : 'outline'}
          onClick={() => setSelectedRole('user')}
        >
          Regular User
        </Button>
        <Button
          type="button"
          variant={selectedRole === 'admin' ? 'default' : 'outline'}
          onClick={() => setSelectedRole('admin')}
        >
          Admin
        </Button>
      </div>
      {selectedRole === 'admin' && (
        <p className="text-xs text-muted-foreground">
          Admin accounts require approval before you can access the system.
        </p>
      )}
    </div>
  </>
)}

// In signUp call:
const { error } = await signUp(
  formData.email, 
  formData.password, 
  formData.fullName,
  selectedRole  // Pass selected role
);
```

---

## Example 3: Admin Approval Management Panel

A new component to manage admin approvals:

```tsx
// components/AdminApprovalPanel.tsx
import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function AdminApprovalPanel() {
  const [pendingAdmins, setPendingAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingAdmins();
  }, []);

  const fetchPendingAdmins = async () => {
    try {
      const response = await api.get('/auth/admin/pending-approvals');
      setPendingAdmins(response.users || []);
    } catch (error) {
      console.error('Failed to fetch pending approvals:', error);
      toast.error('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const approveAdmin = async (adminId: string) => {
    try {
      await api.patch(`/auth/admin/${adminId}/approve`, {});
      toast.success('Admin approved successfully');
      setPendingAdmins(pendingAdmins.filter(admin => admin._id !== adminId));
    } catch (error) {
      console.error('Failed to approve admin:', error);
      toast.error('Failed to approve admin');
    }
  };

  const rejectAdmin = async (adminId: string) => {
    try {
      await api.patch(`/auth/admin/${adminId}/reject`, {});
      toast.success('Admin rejected');
      setPendingAdmins(pendingAdmins.filter(admin => admin._id !== adminId));
    } catch (error) {
      console.error('Failed to reject admin:', error);
      toast.error('Failed to reject admin');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (pendingAdmins.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Admin Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No pending admin requests</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Admin Approvals ({pendingAdmins.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingAdmins.map((admin) => (
            <div key={admin._id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{admin.name}</h3>
                  <p className="text-sm text-muted-foreground">{admin.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Requested: {new Date(admin.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => approveAdmin(admin._id)}
                    variant="default"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => rejectAdmin(admin._id)}
                    variant="destructive"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## Example 4: Login Error Handling with Approval Messages

Update the Auth page to better handle approval-related errors:

```tsx
// In Auth.tsx - Enhanced error display
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  setIsLoading(true);

  try {
    if (isSignUp) {
      const { error, pendingApproval } = await signUp(
        formData.email,
        formData.password,
        formData.fullName,
        selectedRole
      );
      
      if (error) {
        if (pendingApproval) {
          toast.info('Admin account registration successful. Awaiting approval.');
          setIsSignUp(false);
          setFormData({ email: '', password: '', fullName: '' });
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Account created successfully!');
        navigate('/dashboard');
      }
    } else {
      const { error, pendingApproval } = await signIn(formData.email, formData.password);
      
      if (error) {
        if (pendingApproval) {
          toast.warning('Your admin account is awaiting approval. Please contact an administrator.');
        } else if (error.message.includes('Invalid')) {
          toast.error('Invalid email or password');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Signed in successfully!');
        navigate('/dashboard');
      }
    }
  } finally {
    setIsLoading(false);
  }
};

// Display login error if any
{/* In the form JSX */}
{loginError && (
  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
    <p className="text-sm text-amber-800">{loginError}</p>
  </div>
)}
```

---

## Example 5: User Management Component

Admin-only component to manage user roles:

```tsx
// components/UserManagement.tsx
import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldOff } from 'lucide-react';
import { toast } from 'sonner';

export function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'admin' | 'user'>('all');

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const endpoint = filter === 'all' 
        ? '/auth/admin/users' 
        : `/auth/admin/users?role=${filter}`;
      const response = await api.get(endpoint);
      setUsers(response.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const removeAdmin = async (userId: string) => {
    if (!confirm('Are you sure? This will remove admin privileges.')) {
      return;
    }

    try {
      await api.patch(`/auth/admin/${userId}/remove`, {});
      toast.success('Admin privileges removed');
      fetchUsers();
    } catch (error) {
      console.error('Failed to remove admin:', error);
      toast.error('Failed to remove admin privileges');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filter buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              All Users ({users.length})
            </Button>
            <Button
              size="sm"
              variant={filter === 'admin' ? 'default' : 'outline'}
              onClick={() => setFilter('admin')}
            >
              Admins
            </Button>
            <Button
              size="sm"
              variant={filter === 'user' ? 'default' : 'outline'}
              onClick={() => setFilter('user')}
            >
              Regular Users
            </Button>
          </div>

          {/* User list */}
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user._id} className="p-3 border rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? '👑 Admin' : 'User'}
                    </Badge>
                    {user.role === 'admin' && (
                      <Badge variant={user.isApproved ? 'default' : 'destructive'}>
                        {user.isApproved ? '✓ Approved' : '⏳ Pending'}
                      </Badge>
                    )}
                  </div>
                </div>
                {user.role === 'admin' && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeAdmin(user._id)}
                  >
                    <ShieldOff className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## Example 6: Admin Dashboard Navigation Guard

Protect admin routes with proper role checking:

```tsx
// pages/Admin.tsx - Enhanced with proper auth check
import { useNavigate } from 'react-router-dom';
import { useMongoAuth } from '@/hooks/useMongoAuth';
import { useEffect } from 'react';

export default function AdminDashboard() {
  const { isAdminApproved, isLoading } = useMongoAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAdminApproved) {
      // Redirect non-admins
      navigate('/dashboard');
    }
  }, [isAdminApproved, isLoading, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAdminApproved) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AdminApprovalPanel />
        <UserManagement />
        {/* Other admin components */}
      </div>
    </div>
  );
}
```

---

## Example 7: API Service Integration

Update the API service to support the new admin endpoints:

```tsx
// services/api.ts - Add admin methods
const api = {
  auth: {
    register: (email: string, password: string, name: string, role?: 'admin' | 'user') =>
      client.post('/auth/register', { email, password, name, role }),
    
    login: (email: string, password: string) =>
      client.post('/auth/login', { email, password }),
    
    getProfile: () =>
      client.get('/auth/profile'),
    
    logout: () => {
      setAuthToken(null);
      localStorage.removeItem('mongoToken');
    },

    // New admin methods
    admin: {
      getPendingApprovals: () =>
        client.get('/auth/admin/pending-approvals'),
      
      getApprovedAdmins: () =>
        client.get('/auth/admin/approved-admins'),
      
      getAllUsers: (role?: 'admin' | 'user') =>
        client.get(`/auth/admin/users${role ? `?role=${role}` : ''}`),
      
      approveAdmin: (adminId: string) =>
        client.patch(`/auth/admin/${adminId}/approve`, {}),
      
      rejectAdmin: (adminId: string) =>
        client.patch(`/auth/admin/${adminId}/reject`, {}),
      
      removeAdmin: (adminId: string) =>
        client.patch(`/auth/admin/${adminId}/remove`, {}),
    },
  },
};
```

---

## Key Takeaways for Frontend Integration

1. **Always use `isAdminApproved` for showing admin UI**, not just `isAdmin`
2. **Handle `pendingApproval` responses** in login/signup with clear messages
3. **Create approval management components** for existing admins
4. **Show role + approval status** together in user lists
5. **Protect admin routes** by checking `isAdminApproved` in useEffect
6. **Display helpful error messages** when access is denied due to approval
7. **Update API calls** to pass role during signup if needed

These examples provide a foundation for building a complete admin management UI that properly handles the new role-based authentication system.
