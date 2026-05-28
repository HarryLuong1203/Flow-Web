export interface MichelinPlace {
  placeId: string
  name: string
  address: string
  rating: number
  photoUrl: string | null
  website: string | null
  phoneNumber: string | null
  category: string
  michelinType: 'star' | 'bib' | 'selected'
  stars?: number
  lat: number
  lng: number
}

export const michelinPlaces: MichelinPlace[] = [
  {
    placeId: "michelin_anan_saigon",
    name: "Anan Saigon",
    address: "89 Tôn Thất Đạm, Phường Bến Nghé, Quận 1, Hồ Chí Minh",
    rating: 4.8,
    photoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
    website: "https://anansaigon.com",
    phoneNumber: "0903166426",
    category: "Vietnamese, Modern",
    michelinType: "star",
    stars: 1,
    lat: 10.7719,
    lng: 106.7027
  },
  {
    placeId: "michelin_akuna",
    name: "Akuna",
    address: "Lầu 9, Khách sạn Villa Song, 197/2 Nguyễn Văn Hưởng, Thảo Điền, Quận 2, Hồ Chí Minh",
    rating: 4.9,
    photoUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80",
    website: "https://akunarestaurant.com",
    phoneNumber: "0913554553",
    category: "Modern Australian, Fine Dining",
    michelinType: "star",
    stars: 1,
    lat: 10.8093,
    lng: 106.7371
  },
  {
    placeId: "michelin_royal_pavilion",
    name: "The Royal Pavilion (Long Triều)",
    address: "22-36 Nguyễn Huệ, Phường Bến Nghé, Quận 1, Hồ Chí Minh",
    rating: 4.7,
    photoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    website: "https://www.thereveriesaigon.com/restaurants-bars/the-royal-pavilion",
    phoneNumber: "02838236688",
    category: "Cantonese, Dim Sum",
    michelinType: "star",
    stars: 1,
    lat: 10.7728,
    lng: 106.7032
  },
  {
    placeId: "michelin_tre_dining",
    name: "Tre Dining",
    address: "35 Xuân Thủy, Phường Thảo Điền, Quận 2, Hồ Chí Minh",
    rating: 4.8,
    photoUrl: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=600&q=80",
    website: "https://tredining.vn",
    phoneNumber: "0907989796",
    category: "Vietnamese, Modern",
    michelinType: "star",
    stars: 1,
    lat: 10.8038,
    lng: 106.7323
  },
  {
    placeId: "michelin_pho_le",
    name: "Phở Lệ",
    address: "413-415 Nguyễn Trãi, Phường 7, Quận 5, Hồ Chí Minh",
    rating: 4.6,
    photoUrl: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80",
    website: "https://www.facebook.com/phole",
    phoneNumber: "02839234056",
    category: "Noodle, Pho",
    michelinType: "bib",
    lat: 10.7518,
    lng: 106.6669
  },
  {
    placeId: "michelin_bep_me_in",
    name: "Bếp Mẹ Ỉn",
    address: "136/9 Lê Thánh Tôn, Phường Bến Thành, Quận 1, Hồ Chí Minh",
    rating: 4.5,
    photoUrl: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=600&q=80",
    website: "https://bepmein.com",
    phoneNumber: "02822444555",
    category: "Vietnamese, Street Food",
    michelinType: "bib",
    lat: 10.7725,
    lng: 106.6974
  },
  {
    placeId: "michelin_pho_hoa_pasteur",
    name: "Phở Hòa Pasteur",
    address: "260C Pasteur, Phường 8, Quận 3, Hồ Chí Minh",
    rating: 4.5,
    photoUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    website: null,
    phoneNumber: "02838297943",
    category: "Noodle, Pho",
    michelinType: "bib",
    lat: 10.7876,
    lng: 106.6908
  },
  {
    placeId: "michelin_hum_vegetarian",
    name: "Hum Vegetarian",
    address: "32 Võ Văn Tần, Phường 6, Quận 3, Hồ Chí Minh",
    rating: 4.7,
    photoUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
    website: "https://humvegetarian.com",
    phoneNumber: "02839303819",
    category: "Vegetarian, Healthy",
    michelinType: "selected",
    lat: 10.7788,
    lng: 106.6931
  },
  {
    placeId: "michelin_cuc_gach_quan",
    name: "Cục Gạch Quán",
    address: "10 Đặng Tất, Phường Tân Định, Quận 1, Hồ Chí Minh",
    rating: 4.6,
    photoUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
    website: "http://www.cucgachquan.com.vn",
    phoneNumber: "02838480103",
    category: "Vietnamese, Home-style",
    michelinType: "selected",
    lat: 10.7925,
    lng: 106.6896
  },
  {
    placeId: "michelin_dim_tu_tac",
    name: "Dim Tu Tac",
    address: "55 Đông Du, Phường Bến Nghé, Quận 1, Hồ Chí Minh",
    rating: 4.5,
    photoUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80",
    website: "https://www.dimtutac.com",
    phoneNumber: "02838266668",
    category: "Cantonese, Dim Sum",
    michelinType: "selected",
    lat: 10.7758,
    lng: 106.7036
  },
  {
    placeId: "michelin_quan_bui",
    name: "Quán Bụi",
    address: "17A Ngô Văn Năm, Phường Bến Nghé, Quận 1, Hồ Chí Minh",
    rating: 4.4,
    photoUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=600&q=80",
    website: "https://quan-bui.com",
    phoneNumber: "02838291515",
    category: "Vietnamese, Home-style",
    michelinType: "selected",
    lat: 10.7801,
    lng: 106.7051
  },
  {
    placeId: "michelin_sol_kitchen",
    name: "Sol Kitchen & Bar",
    address: "115 Lý Tự Trọng, Phường Bến Thành, Quận 1, Hồ Chí Minh",
    rating: 4.5,
    photoUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=600&q=80",
    website: "https://www.solkitchenandbar.com",
    phoneNumber: "0799999115",
    category: "Latin American, Modern",
    michelinType: "selected",
    lat: 10.7719,
    lng: 106.6970
  },
  {
    placeId: "michelin_rice_field",
    name: "Rice Field",
    address: "75-77 Hồ Tùng Mậu, Phường Bến Nghé, Quận 1, Hồ Chí Minh",
    rating: 4.4,
    photoUrl: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=600&q=80",
    website: "https://www.facebook.com/ricefieldsaigon",
    phoneNumber: "0906898687",
    category: "Vietnamese, Home-style",
    michelinType: "bib",
    lat: 10.7714,
    lng: 106.7029
  },
  {
    placeId: "michelin_gia",
    name: "Gia",
    address: "61 Quốc Tử Giám, Quận Đống Đa, Hà Nội",
    rating: 4.8,
    photoUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80",
    website: "https://gia-restaurant.com",
    phoneNumber: "0896682996",
    category: "Vietnamese, Modern",
    michelinType: "star",
    stars: 1,
    lat: 21.0278,
    lng: 105.8354
  },
  {
    placeId: "michelin_koki",
    name: "Hibana by Koki",
    address: "Khách sạn Capella Hanoi, 11 Lê Phụng Hiểu, Hoàn Kiếm, Hà Nội",
    rating: 4.9,
    photoUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80",
    website: "https://capellahotels.com/en/capella-hanoi/dining/koki",
    phoneNumber: "02439878888",
    category: "Japanese, Teppanyaki",
    michelinType: "star",
    stars: 1,
    lat: 21.0263,
    lng: 105.8576
  },
  {
    placeId: "michelin_tam_vi",
    name: "Tầm Vị",
    address: "4B Yên Thế, Phường Văn Miếu, Quận Đống Đa, Hà Nội",
    rating: 4.6,
    photoUrl: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=600&q=80",
    website: "https://www.facebook.com/nhahangtamvi",
    phoneNumber: "0906232525",
    category: "Vietnamese, Traditional",
    michelinType: "star",
    stars: 1,
    lat: 21.0289,
    lng: 105.8398
  }
];
