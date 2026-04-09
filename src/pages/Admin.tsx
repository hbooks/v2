import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Edit,
  Package,
  Users,
  MessageSquare,
  Newspaper,
  BarChart3,
  X,
  LogOut,
} from "lucide-react";

// ---------- Types ----------
type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  type: "book" | "exclusive";
  stock_status: "in_stock" | "out_of_stock";
  images: string[];
  file_url?: string;
  created_at: string;
};

type Update = {
  id: string;
  title: string;
  content: string;
  created_at: string;
};

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

type Stat = {
  totalProducts: number;
  totalUsers: number;
  totalMembers: number;
  totalMessages: number;
};

// ---------- Helper: Upload multiple images ----------
async function uploadImages(files: FileList, productName: string): Promise<string[]> {
  const uploadedUrls: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}_${productName.replace(/\s/g, "_")}_${i}.${ext}`;
    const { data, error } = await supabase.storage
      .from("product-covers")
      .upload(fileName, file, { upsert: true });
    if (error) {
      console.error("Upload error:", error);
      toast.error(`Failed to upload ${file.name}`);
      continue;
    }
    const { data: publicUrl } = supabase.storage.from("product-covers").getPublicUrl(data.path);
    uploadedUrls.push(publicUrl.publicUrl);
  }
  return uploadedUrls;
}

// ---------- Main Admin Component ----------
export default function AdminPage() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<"overview" | "products" | "updates" | "messages">("overview");
  const [products, setProducts] = useState<Product[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [stats, setStats] = useState<Stat>({
    totalProducts: 0,
    totalUsers: 0,
    totalMembers: 0,
    totalMessages: 0,
  });

  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<Update | null>(null);

  // Form states
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    type: "book" as "book" | "exclusive",
    stock_status: "in_stock" as "in_stock" | "out_of_stock",
    existingImages: [] as string[],
    newImages: [] as File[],
    product_file: null as File | null,
  });
  const [updateForm, setUpdateForm] = useState({ title: "", content: "" });

  // Handle admin login using Supabase Auth
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (!loginEmail || !loginPassword) {
      setLoginError("Please enter both email and password");
      return;
    }
    if (loginEmail !== "admin@hpbooks.uk") {
      setLoginError("Only admin@hpbooks.uk can access this panel");
      return;
    }
    setLoginLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (error) throw error;
      setIsAdminLoggedIn(true);
      toast.success("Admin access granted");
      fetchAllData();
    } catch (err: any) {
      setLoginError(err.message || "Invalid credentials");
      toast.error("Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle logout – sign out from Supabase and reset state
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdminLoggedIn(false);
    setLoginEmail("");
    setLoginPassword("");
    toast.info("Logged out of admin panel");
  };

// Fetch all data (only after successful login)
const fetchAllData = async () => {
  setLoadingData(true);
  try {
    // Products
    const { data: productsData } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    setProducts(productsData || []);

    // Updates
    const { data: updatesData } = await supabase
      .from("updates")
      .select("*")
      .order("created_at", { ascending: false });
    setUpdates(updatesData || []);

    // Contact messages
    const { data: messagesData } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    setMessages(messagesData || []);

    // Total products
    const { count: totalProducts } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    // Total users: members + unverified_users
    const { count: membersCount } = await supabase
      .from("members")
      .select("*", { count: "exact", head: true });
    const { count: unverifiedCount } = await supabase
      .from("unverified_users")
      .select("*", { count: "exact", head: true });
    const totalUsers = (membersCount || 0) + (unverifiedCount || 0);

    // Active members: members with tag='member' AND (expiry_date is NULL OR expiry_date > now)
    const { count: activeMembers } = await supabase
      .from("members")
      .select("*", { count: "exact", head: true })
      .eq("tag", "member")
      .or("expiry_date.is.null,expiry_date.gt.now()");

    // Total messages
    const { count: totalMessages } = await supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true });

    setStats({
      totalProducts: totalProducts || 0,
      totalUsers: totalUsers,
      totalMembers: activeMembers || 0,
      totalMessages: totalMessages || 0,
    });
  } catch (err) {
    console.error("Fetch error:", err);
    toast.error("Failed to load admin data");
  } finally {
    setLoadingData(false);
  }
};

// ---------- Product CRUD ----------
const resetProductForm = () => {
  setProductForm({
    name: "",
    description: "",
    price: "",
    type: "book",
    stock_status: "in_stock",
    existingImages: [],
    newImages: [],
    product_file: null,
  });
};

const handleProductSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!productForm.name || !productForm.price) {
    toast.error("Name and price are required");
    return;
  }

  let imageUrls = [...productForm.existingImages];
  if (productForm.newImages.length > 0) {
    const newUrls = await uploadImages(productForm.newImages as unknown as FileList, productForm.name);
    imageUrls = [...imageUrls, ...newUrls];
  }

  let filePath = editingProduct?.file_url || "";
  if (productForm.product_file) {
    const ext = productForm.product_file.name.split(".").pop();
    const fileName = `${Date.now()}_${productForm.name.replace(/\s/g, "_")}.${ext}`;
    const { data, error } = await supabase.storage.from("product-files").upload(fileName, productForm.product_file, { upsert: true });
      if (!error && data) {
    filePath = data.path;
    console.log("✅ File uploaded, path saved to DB:", filePath); // ADD THIS
  } else {
    console.error("Upload error:", error);
    toast.error("Failed to upload product file");
  }
  }

  // ✅ Validate stock_status
  let stockStatus = productForm.stock_status;
  console.log("Raw stock_status from form:", stockStatus);
  if (stockStatus !== 'in_stock' && stockStatus !== 'out_of_stock') {
    console.warn(`Invalid stock_status: "${stockStatus}", defaulting to "in_stock"`);
    stockStatus = 'in_stock';
    setProductForm(prev => ({ ...prev, stock_status: 'in_stock' }));
  }

  const productData = {
    name: productForm.name,
    description: productForm.description || null,
    price: parseFloat(productForm.price),
    type: productForm.type,
    stock_status: stockStatus,
    images: imageUrls,
    file_url: filePath,
  };

  console.log("Final productData being sent:", productData);

  let error;
  if (editingProduct) {
    const { error: updateErr } = await supabase.from("products").update(productData).eq("id", editingProduct.id);
    error = updateErr;
    if (!error) toast.success("Product updated");
  } else {
    const { error: insertErr } = await supabase.from("products").insert([productData]);
    error = insertErr;
    if (!error) toast.success("Product added");
  }
  if (error) {
    console.error("Product save error:", error);
    toast.error(error.message);
  } else {
    fetchAllData();
    setShowProductModal(false);
    resetProductForm();
  }
};

const deleteProduct = async (id: string) => {
  if (!confirm("Delete this product permanently?")) return;
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) toast.error(error.message);
  else {
    toast.success("Product deleted");
    fetchAllData();
  }
};

const toggleStock = async (id: string, currentStatus: string) => {
  const newStatus = currentStatus === "in_stock" ? "out_of_stock" : "in_stock";
  const { error } = await supabase.from("products").update({ stock_status: newStatus }).eq("id", id);
  if (error) toast.error(error.message);
  else {
    toast.success(`Product ${newStatus === "in_stock" ? "in stock" : "out of stock"}`);
    fetchAllData();
  }
};

const openProductModal = (product?: Product) => {
  if (product) {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      type: product.type,
      stock_status: product.stock_status || "in_stock",
      existingImages: product.images || [],
      newImages: [],
      product_file: null,
    });
  } else {
    setEditingProduct(null);
    resetProductForm();
  }
  setShowProductModal(true);
};

const removeExistingImage = (urlToRemove: string) => {
  setProductForm({
    ...productForm,
    existingImages: productForm.existingImages.filter(url => url !== urlToRemove),
  });
};

  // ---------- Update CRUD ----------
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateForm.title || !updateForm.content) {
      toast.error("Title and content are required");
      return;
    }
    let error;
    if (editingUpdate) {
      const { error: updateErr } = await supabase.from("updates").update({ title: updateForm.title, content: updateForm.content }).eq("id", editingUpdate.id);
      error = updateErr;
      if (!error) toast.success("Update edited");
    } else {
      const { error: insertErr } = await supabase.from("updates").insert([{ title: updateForm.title, content: updateForm.content }]);
      error = insertErr;
      if (!error) toast.success("Update posted");
    }
    if (error) toast.error(error.message);
    else {
      fetchAllData();
      setShowUpdateModal(false);
      resetUpdateForm();
    }
  };

  const deleteUpdate = async (id: string) => {
    if (!confirm("Delete this update?")) return;
    const { error } = await supabase.from("updates").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Update deleted");
      fetchAllData();
    }
  };

  const openUpdateModal = (update?: Update) => {
    if (update) {
      setEditingUpdate(update);
      setUpdateForm({ title: update.title, content: update.content });
    } else {
      setEditingUpdate(null);
      resetUpdateForm();
    }
    setShowUpdateModal(true);
  };

  const resetUpdateForm = () => setUpdateForm({ title: "", content: "" });

  // ---------- Message handling ----------
  const deleteMessage = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Message deleted");
      fetchAllData();
    }
  };

  // ---------- Render login form if not authenticated ----------
  if (!isAdminLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-lg">
          <h1 className="mb-2 text-3xl font-bold text-foreground">Admin Login</h1>
          <p className="mb-6 text-sm text-muted-foreground">Enter your admin credentials to access the panel</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
                placeholder="admin@hpbooks.uk"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
                placeholder="••••••••"
                required
              />
            </div>
            {loginError && <p className="text-sm text-destructive">{loginError}</p>}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loginLoading ? "Logging in..." : "Log In"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ---------- Loading state for admin panel data ----------
  if (loadingData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // ---------- Admin Panel UI ----------
  const tabs = [
    { id: "overview" as const, label: "Overview", icon: BarChart3 },
    { id: "products" as const, label: "Products", icon: Package },
    { id: "updates" as const, label: "Updates", icon: Newspaper },
    { id: "messages" as const, label: "Messages", icon: MessageSquare },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card p-6 flex flex-col">
        <h1 className="mb-8 font-heading text-xl font-bold text-foreground">
          Hbooks <span className="text-primary">Admin</span>
        </h1>
        <nav className="space-y-1 flex-1">
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
        <button
          onClick={handleLogout}
          className="mt-6 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-destructive hover:bg-secondary transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {activeTab === "overview" && (
          <div>
            <h2 className="mb-6 font-heading text-2xl font-bold text-foreground">Dashboard Overview</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Products" value={stats.totalProducts} icon={Package} />
              <StatCard label="Total Users" value={stats.totalUsers} icon={Users} />
              <StatCard label="Active Members" value={stats.totalMembers} icon={Users} />
              <StatCard label="Messages" value={stats.totalMessages} icon={MessageSquare} />
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-heading text-2xl font-bold text-foreground">Products</h2>
              <button onClick={() => openProductModal()} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4" /> Add Product
              </button>
            </div>
            {products.length === 0 ? (
              <p className="text-muted-foreground">No products yet. Click "Add Product" to get started.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-secondary/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Image</th>
                      <th className="px-4 py-3 text-left font-medium">Name</th>
                      <th className="px-4 py-3 text-left font-medium">Type</th>
                      <th className="px-4 py-3 text-left font-medium">Price</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3">
                          {product.images && product.images[0] ? (
                            <img src={product.images[0]} alt="" className="h-10 w-10 rounded object-cover" />
                          ) : (
                            <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">No img</div>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium">{product.name}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs capitalize">{product.type}</span>
                        </td>
                        <td className="px-4 py-3">${product.price.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleStock(product.id, product.stock_status)}
                            className={`rounded-full px-2 py-0.5 text-xs ${
                              product.stock_status === "in_stock"
                                ? "bg-primary/20 text-primary"
                                : "bg-destructive/20 text-destructive"
                            }`}
                          >
                            {product.stock_status === "in_stock" ? "In Stock" : "Out of Stock"}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => openProductModal(product)} className="mr-2 text-muted-foreground hover:text-foreground"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => deleteProduct(product.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "updates" && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-heading text-2xl font-bold text-foreground">News Updates</h2>
              <button onClick={() => openUpdateModal()} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4" /> New Update
              </button>
            </div>
            {updates.length === 0 ? (
              <p className="text-muted-foreground">No new updates regarding shop or products.</p>
            ) : (
              <div className="space-y-4">
                {updates.map((update) => (
                  <div key={update.id} className="flex items-start justify-between rounded-lg border border-border bg-card p-4">
                    <div className="flex-1">
                      <h3 className="font-heading text-lg font-semibold text-foreground">{update.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{update.content}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{new Date(update.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openUpdateModal(update)} className="text-muted-foreground hover:text-foreground"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => deleteUpdate(update.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "messages" && (
          <div>
            <h2 className="mb-6 font-heading text-2xl font-bold text-foreground">Contact Messages</h2>
            {messages.length === 0 ? (
              <p className="text-muted-foreground">No messages yet.</p>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{msg.name}</p>
                        <p className="text-xs text-muted-foreground">{msg.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{new Date(msg.created_at).toLocaleDateString()}</span>
                        <button onClick={() => deleteMessage(msg.id)} className="text-xs text-destructive hover:underline">Delete</button>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{msg.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Product Modal */}
      {showProductModal && (
        <Modal onClose={() => setShowProductModal(false)}>
          <h3 className="mb-4 font-heading text-xl font-bold">{editingProduct ? "Edit Product" : "Add Product"}</h3>
          <form onSubmit={handleProductSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Product Name"
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              required
            />
            <textarea
              placeholder="Description (optional)"
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              rows={3}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Price (USD)"
              value={productForm.price}
              onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              required
            />
            <select
              value={productForm.type}
              onChange={(e) => setProductForm({ ...productForm, type: e.target.value as any })}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="book">Book</option>
              <option value="exclusive">Exclusive Scene</option>
            </select>
            <select
              value={productForm.stock_status}
              onChange={(e) => setProductForm({ ...productForm, stock_status: e.target.value as any })}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="in_stock">In Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>

            {/* Existing images preview */}
            {productForm.existingImages.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-1">Current Images</label>
                <div className="flex flex-wrap gap-2">
                  {productForm.existingImages.map((url, idx) => (
                    <div key={idx} className="relative">
                      <img src={url} alt="" className="h-16 w-16 rounded object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(url)}
                        className="absolute -top-2 -right-2 rounded-full bg-destructive p-0.5 text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload new images */}
            <div>
              <label className="block text-sm font-medium mb-1">Add New Images (multiple)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setProductForm({ ...productForm, newImages: Array.from(e.target.files || []) })}
                className="w-full"
              />
              {productForm.newImages.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">{productForm.newImages.length} new file(s) selected</p>
              )}
            </div>

            {/* Product file upload */}
            <div>
              <label className="block text-sm font-medium mb-1">Product File (PDF/EPUB)</label>
              <input
                type="file"
                accept=".pdf,.epub"
                onChange={(e) => setProductForm({ ...productForm, product_file: e.target.files?.[0] || null })}
                className="w-full"
              />
              {productForm.product_file && (
                <p className="text-xs text-muted-foreground mt-1">{productForm.product_file.name}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowProductModal(false)} className="rounded-md border border-input px-4 py-2 text-sm">Cancel</button>
              <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">{editingProduct ? "Update" : "Create"}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Update Modal */}
      {showUpdateModal && (
        <Modal onClose={() => setShowUpdateModal(false)}>
          <h3 className="mb-4 font-heading text-xl font-bold">{editingUpdate ? "Edit Update" : "New Update"}</h3>
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Title"
              value={updateForm.title}
              onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              required
            />
            <textarea
              placeholder="Content"
              value={updateForm.content}
              onChange={(e) => setUpdateForm({ ...updateForm, content: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              rows={5}
              required
            />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowUpdateModal(false)} className="rounded-md border border-input px-4 py-2 text-sm">Cancel</button>
              <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">{editingUpdate ? "Update" : "Post"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ---------- Helper Components ----------
function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <p className="mt-3 text-3xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-card p-6 shadow-lg">
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        {children}
      </div>
    </div>
  );
}