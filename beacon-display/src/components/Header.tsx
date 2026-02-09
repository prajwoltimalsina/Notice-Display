import { Link, useNavigate } from 'react-router-dom';
import { useMongoAuth } from '@/hooks/useMongoAuth';
import { Button } from './ui/button';
import { Monitor, LogOut, Settings, User, LayoutDashboard } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function Header() {
  const { user, isAdmin, signOut } = useMongoAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 glass-panel z-50 flex items-center justify-between px-6">
      <Link to="/" className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <Monitor className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-semibold">KU Notice Board</h1>
          <p className="text-xs text-muted-foreground">Digital Display System</p>
        </div>
      </Link>

      <nav className="flex items-center gap-4">
        <Link to="/display">
          <Button variant="ghost" size="sm" className="gap-2">
            <Monitor className="w-4 h-4" />
            Display
          </Button>
        </Link>

        {user ? (
          <>
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Button>
            </Link>

            {isAdmin && (
              <Link to="/admin">
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Admin
                </Button>
              </Link>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                  <User className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{user.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{isAdmin ? 'Admin' : 'User'}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Link to="/auth">
            <Button variant="glow" size="sm">
              Sign In
            </Button>
          </Link>
        )}
      </nav>
    </header>
  );
}
