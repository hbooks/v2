import { useState } from "react";
import { Plus, Trash2, Edit, Package, Users, MessageSquare, Newspaper, Upload, BarChart3 } from "lucide-react";
import { mockProducts, mockUpdates, Product } from "@/lib/mock-data";
import { toast } from "sonner";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"products" | "updates" | "messages" | "overview">("overview");
  const [products] = useState(mockProducts);

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: BarChart3 },
    { id: "products" as const, label: "Products", icon: Package },
    { id: "updates" as const, label: "Updates", icon: Newspaper },
    { id: "messages" as const, label: "Messages", icon: MessageSquare },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card p-6">
        <h1 className="mb-8 font-heading text-xl font-bold text-foreground">
          Hbooks <span className="text-primary">Admin</span>
        </h1>
        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-secondary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "products" && <ProductsTab products={products} />}
        {activeTab === "updates" && <UpdatesTab />}
        {activeTab === "messages" && <MessagesTab />}
      </main>
    </div>
  );
}

function OverviewTab() {
  const stats = [
    { label: "Total Products", value: "5", icon: Package },
    { label: "Total Users", value: "128", icon: Users },
    { label: "Messages", value: "12", icon: MessageSquare },
    { label: "Updates", value: "3", icon: Newspaper },
  ];

  return (
    <div>
      <h2 className="mb-6 font-heading text-2xl font-bold text-foreground">Dashboard Overview</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="mt-3 text-3xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductsTab({ products }: { products: Product[] }) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold text-foreground">Products</h2>
        <button
          onClick={() => toast.info("Product form will be connected to Supabase")}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Product</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Price</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-foreground">{product.name}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                    {product.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-foreground">${product.price.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${
                    product.stock_status === "in_stock"
                      ? "bg-primary/20 text-primary"
                      : "bg-destructive/20 text-destructive"
                  }`}>
                    {product.stock_status === "in_stock" ? "In Stock" : "Out of Stock"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="mr-2 text-muted-foreground hover:text-foreground">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UpdatesTab() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold text-foreground">News Updates</h2>
        <button
          onClick={() => toast.info("Update form will be connected to Supabase")}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> New Update
        </button>
      </div>

      <div className="space-y-4">
        {mockUpdates.map((update) => (
          <div key={update.id} className="flex items-start justify-between rounded-lg border border-border bg-card p-4">
            <div>
              <h3 className="font-heading text-lg font-semibold text-foreground">{update.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{update.content}</p>
              <p className="mt-2 text-xs text-muted-foreground">{update.date}</p>
            </div>
            <div className="flex gap-2">
              <button className="text-muted-foreground hover:text-foreground"><Edit className="h-4 w-4" /></button>
              <button className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MessagesTab() {
  const mockMessages = [
    { id: "1", name: "Jane Doe", email: "jane@example.com", message: "Love your books! When's the next release?", date: "2026-03-30" },
    { id: "2", name: "John Smith", email: "john@example.com", message: "Having trouble downloading my purchase.", date: "2026-03-29" },
  ];

  return (
    <div>
      <h2 className="mb-6 font-heading text-2xl font-bold text-foreground">Contact Messages</h2>
      <div className="space-y-4">
        {mockMessages.map((msg) => (
          <div key={msg.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{msg.name}</p>
                <p className="text-xs text-muted-foreground">{msg.email}</p>
              </div>
              <span className="text-xs text-muted-foreground">{msg.date}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{msg.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
