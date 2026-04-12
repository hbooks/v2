import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-heading text-lg font-bold">Hbooks Stores</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Premium digital books and exclusive content by H.P.
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-heading text-sm font-semibold text-foreground">Shop</h4>
            <div className="flex flex-col gap-2">
              <Link to="/my-books" className="text-sm text-muted-foreground hover:text-foreground">My Books</Link>
              <Link to="/exclusive" className="text-sm text-muted-foreground hover:text-foreground">Exclusive Scenes</Link>
              <Link to="/membership" className="text-sm text-muted-foreground hover:text-foreground">Membership</Link>
            </div>
          </div>
          <div>
             <h4 className="mb-3 font-heading text-sm font-semibold text-foreground">Support</h4>
            <div className="flex flex-col gap-2">
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link>
              <Link to="/updates" className="text-sm text-muted-foreground hover:text-foreground">Updates</Link>
              <a
                href="https://status.hpbooks.uk/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                System Status
              </a>
            </div>
          </div>
          <div>
            <h4 className="mb-3 font-heading text-sm font-semibold text-foreground">Legal</h4>
            <div className="flex flex-col gap-2">
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link>
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Hbooks Stores. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
