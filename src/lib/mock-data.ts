import bookCover1 from "@/assets/book-cover-1.jpg";
import bookCover2 from "@/assets/book-cover-2.jpg";
import bookCover3 from "@/assets/book-cover-3.jpg";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  type: "book" | "exclusive";
  stock_status: "in_stock" | "out_of_stock";
  cover_image_url: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Update {
  id: string;
  title: string;
  content: string;
  date: string;
}

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "The Forgotten Realm",
    description: "An epic journey through a world where magic is fading and one unlikely hero must restore the balance before darkness consumes everything.",
    price: 12.99,
    type: "book",
    stock_status: "in_stock",
    cover_image_url: bookCover1,
  },
  {
    id: "2",
    name: "Celestial Awakening",
    description: "When the stars align and ancient prophecies begin to unfold, a young astronomer discovers she holds the key to humanity's survival.",
    price: 14.99,
    type: "book",
    stock_status: "in_stock",
    cover_image_url: bookCover2,
  },
  {
    id: "3",
    name: "Embers of the Heart",
    description: "A sweeping romance set against the backdrop of a war-torn kingdom, where love becomes the most powerful weapon of all.",
    price: 11.99,
    type: "book",
    stock_status: "in_stock",
    cover_image_url: bookCover3,
  },
  {
    id: "4",
    name: "Behind the Forgotten Realm",
    description: "Exclusive deleted scenes and author commentary from The Forgotten Realm. Discover the stories that didn't make the final cut.",
    price: 4.99,
    type: "exclusive",
    stock_status: "in_stock",
    cover_image_url: bookCover1,
  },
  {
    id: "5",
    name: "Celestial Awakening: Chapter Zero",
    description: "The prequel chapter that reveals the origins of the prophecy. Available exclusively here.",
    price: 3.99,
    type: "exclusive",
    stock_status: "in_stock",
    cover_image_url: bookCover2,
  },
];

export const mockUpdates: Update[] = [
  {
    id: "1",
    title: "New Release: Embers of the Heart",
    content: "I'm thrilled to announce that my latest novel is now available! This has been a labor of love and I can't wait for you to read it.",
    date: "2026-03-28",
  },
  {
    id: "2",
    title: "Exclusive Content Drop",
    content: "Members now have access to the deleted prologue of The Forgotten Realm. Log in to your member account to read it!",
    date: "2026-03-15",
  },
  {
    id: "3",
    title: "Spring Sale Coming Soon",
    content: "Stay tuned for our spring sale starting April 10th. All books will be 20% off for one week only.",
    date: "2026-03-01",
  },
];
