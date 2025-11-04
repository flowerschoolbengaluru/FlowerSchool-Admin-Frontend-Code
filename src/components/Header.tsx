import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link, useLocation } from "react-router-dom";
import flowerSchoolLogo from "@/assets/flower-school-logo.png";
import { AuthButtons } from "@/components/auth/AuthButtons";

interface HeaderProps {
  onAdminClick: () => void;
  onNavigate: (section: string) => void;
}

const Header = ({ onAdminClick, onNavigate }: HeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Classes & Programs", path: "/classes" },
    { name: "Calendar", path: "/calendar" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-pink-50/95 backdrop-blur supports-[backdrop-filter]:bg-pink-50/60 border-b border-pink-200">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo - Responsive sizing */}
          <Link to="/" className="flex items-center cursor-pointer flex-shrink-0">
            <img
              src={flowerSchoolLogo}
              alt="The Flower School"
              className="h-8 sm:h-9 md:h-10 lg:h-12 w-auto mr-2 sm:mr-3"
            />
            <div className="flex flex-col">
              <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-sans font-bold text-pink-700 leading-tight whitespace-nowrap">
                The Flower School
              </h1>
              <p className="text-xs text-muted-foreground font-sans hidden xs:block">Bengaluru</p>
            </div>
          </Link>

          {/* Desktop Navigation - Hidden on mobile and tablet */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-sm xl:text-base text-foreground hover:text-pink-600 transition font-medium whitespace-nowrap font-sans ${
                  location.pathname === item.path
                    ? "text-pink-600 border-b-2 border-pink-600"
                    : ""
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Tablet Navigation - Visible only on medium screens */}
          <nav className="hidden md:flex lg:hidden items-center space-x-3">
            {navItems.slice(0, 3).map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-xs sm:text-sm text-foreground hover:text-pink-600 transition font-medium whitespace-nowrap font-sans ${
                  location.pathname === item.path
                    ? "text-pink-600 border-b-2 border-pink-600"
                    : ""
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
            <AuthButtons />
          </div>

          {/* Mobile Menu Button - Visible on mobile and tablet */}
          <div className="flex md:hidden lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-1.5 sm:p-2 h-9 w-9 sm:h-10 sm:w-10"
                >
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[85vw] max-w-[320px] sm:max-w-[350px] bg-pink-50 p-4 sm:p-6 overflow-y-auto"
              >
                <div className="flex flex-col h-full">
                  {/* Mobile Logo */}
                  <div className="flex items-center pb-4 border-b border-pink-200 mb-4">
                    <img
                      src={flowerSchoolLogo}
                      alt="The Flower School"
                      className="h-8 sm:h-10 w-auto mr-3"
                    />
                    <div>
                      <h2 className="text-lg sm:text-xl font-sans font-bold text-pink-700">
                        The Flower School
                      </h2>
                      <p className="text-xs sm:text-sm text-muted-foreground font-sans">Bengaluru</p>
                    </div>
                  </div>

                  {/* Mobile Navigation Links */}
                  <nav className="flex-1 space-y-2 sm:space-y-3">
                    {navItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`block text-base sm:text-lg font-medium text-foreground hover:text-pink-600 transition-colors py-2.5 px-3 sm:py-3 sm:px-4 rounded-lg font-sans ${
                          location.pathname === item.path
                            ? "text-pink-600 font-semibold bg-pink-100 border border-pink-200"
                            : "hover:bg-pink-50"
                        }`}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                  
                  {/* Mobile Auth Section */}
                  <div className="pt-4 mt-4 border-t border-pink-200">
                    <div className="mobile-auth-wrapper">
                      <AuthButtons onMenuClose={() => setIsOpen(false)} />
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Tablet Menu Button - Visible only on medium screens when nav is condensed */}
          <div className="hidden md:flex lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-2 h-9 w-9"
                >
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[380px] max-w-[90vw] bg-pink-50 p-6"
              >
                <div className="flex flex-col h-full">
                  {/* Tablet Logo */}
                  <div className="flex items-center pb-4 border-b border-pink-200 mb-6">
                    <img
                      src={flowerSchoolLogo}
                      alt="The Flower School"
                      className="h-10 w-auto mr-3"
                    />
                    <div>
                      <h2 className="text-xl font-sans font-bold text-pink-700">
                        The Flower School
                      </h2>
                      <p className="text-sm text-muted-foreground font-sans">Bengaluru</p>
                    </div>
                  </div>

                  {/* All Navigation Links */}
                  <nav className="flex-1 space-y-3">
                    {navItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`block text-lg font-medium text-foreground hover:text-pink-600 transition-colors py-3 px-4 rounded-lg font-sans ${
                          location.pathname === item.path
                            ? "text-pink-600 font-semibold bg-pink-100 border border-pink-200"
                            : "hover:bg-pink-50"
                        }`}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                  
                  {/* Tablet Auth Section */}
                  <div className="pt-6 border-t border-pink-200">
                    <AuthButtons onMenuClose={() => setIsOpen(false)} />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;