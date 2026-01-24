import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
    Home,
    ShoppingBag,
    Briefcase,
    User,
    Menu,
    X,
    Plus,
    Bell,
    Search,
    LogOut,
    Moon,
    Sun,
    Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { useTheme } from '@/hooks/useTheme';
import { cn, getInitials } from '@/lib/utils';

const navItems = [
    { href: '/', label: 'Inicio', icon: Home },
    { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
    { href: '/services', label: 'Servicios', icon: Briefcase },
    { href: '/profile', label: 'Mi Perfil', icon: User },
];

export function MainLayout() {
    const { user, signOut } = useAuth();
    const { isAdmin } = useAdmin();
    const { resolvedTheme, toggleTheme } = useTheme();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-xl font-bold text-primary">AIS</span>
                        <span className="text-xl font-light">Trueque</span>
                    </Link>

                    {/* Search - Desktop */}
                    <div className="hidden flex-1 max-w-md mx-8 md:block">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar uniformes, libros, servicios..."
                                className="pl-9"
                            />
                        </div>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden items-center gap-1 md:flex">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                    location.pathname === item.href
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <Link to="/marketplace/new">
                            <Button size="sm" className="hidden sm:flex">
                                <Plus className="mr-1 h-4 w-4" />
                                Publicar
                            </Button>
                        </Link>

                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
                                3
                            </span>
                        </Button>

                        {/* Theme Toggle */}
                        <Button variant="ghost" size="icon" onClick={toggleTheme} title={resolvedTheme === 'light' ? 'Modo oscuro' : 'Modo claro'}>
                            {resolvedTheme === 'light' ? (
                                <Moon className="h-5 w-5" />
                            ) : (
                                <Sun className="h-5 w-5" />
                            )}
                        </Button>

                        {/* Admin Panel Button - Only visible to admins */}
                        {isAdmin && (
                            <Link to="/admin">
                                <Button variant="ghost" size="icon" title="Panel de Administración">
                                    <Shield className="h-5 w-5 text-orange-500" />
                                </Button>
                            </Link>
                        )}

                        {/* User menu */}
                        {user && (
                            <div className="hidden items-center gap-2 md:flex">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                                    {user.photoURL ? (
                                        <img
                                            src={user.photoURL}
                                            alt={user.displayName}
                                            className="h-full w-full rounded-full object-cover"
                                        />
                                    ) : (
                                        getInitials(user.displayName)
                                    )}
                                </div>
                                <Button variant="ghost" size="icon" onClick={signOut}>
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        {/* Mobile menu button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Mobile Search */}
                <div className="border-t px-4 py-2 md:hidden">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Buscar..." className="pl-9" />
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <nav className="border-t p-4 md:hidden">
                        <div className="flex flex-col gap-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={cn(
                                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                        location.pathname === item.href
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-muted-foreground hover:bg-muted'
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.label}
                                </Link>
                            ))}
                            <Link
                                to="/marketplace/new"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="mt-2"
                            >
                                <Button className="w-full">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Publicar Artículo
                                </Button>
                            </Link>

                            {/* Admin Panel - Mobile - Only visible to admins */}
                            {isAdmin && (
                                <Link
                                    to="/admin"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="mt-2"
                                >
                                    <Button variant="outline" className="w-full">
                                        <Shield className="mr-2 h-4 w-4 text-orange-500" />
                                        Panel de Administración
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </nav>
                )}
            </header>

            {/* Main content */}
            <main className="container py-6">
                <Outlet />
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
                <div className="flex items-center justify-around py-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                'flex flex-col items-center gap-1 px-3 py-1',
                                location.pathname === item.href
                                    ? 'text-primary'
                                    : 'text-muted-foreground'
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            <span className="text-xs">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </nav>

            {/* Bottom padding for mobile nav */}
            <div className="h-16 md:hidden" />
        </div>
    );
}
