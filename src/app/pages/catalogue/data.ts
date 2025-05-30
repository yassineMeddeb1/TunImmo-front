/**
 * Top Offers List
 */
 const topOfferData = [
  {
      verified_btn: 'Verified',
      btn: "new",
      btn_color: "bg-info",
      image: [
        {img : "assets/img/real-estate/catalog/06.jpg"},
        {img : "assets/img/real-estate/catalog/06.jpg"}
      ],
      sale: 'For rent',
      title: "3-bed Apartment | 67 sq.m",
      address: "3811 Ditmars Blvd Astoria, NY 11105",
      price: "1,629",
      bad: "3",
      bath: "2",
      car: "2",
      location:"New York",
      district:"Brooklyn",
      property:"Apartment",
      metres:"67",
      pents:"allow-cats",
      amenities:"air-condition"
  },
  {
    verified_btn: '',
    btn: "New",
    btn_color: "bg-info",
    image: [
        {img : "assets/img/real-estate/catalog/07.jpg"},
        {img : "assets/img/real-estate/catalog/07.jpg"}
      ],
    sale: 'For sale',
    title: "Pine Apartments | 56 sq.m",
    address: "3811 Ditmars Blvd Astoria, NY 11105",
    price: "2,000",
    bad: "4",
    bath: "2",
    car: "2",
    location:"New York",
    district:"Manhattan",
    property:"Apartment",
    metres:"56",
    pents:"allow-cats",
    amenities:"balcony"
  },
  {
    verified_btn: '',
    btn: "New",
    btn_color: "bg-info",
    image: [
        {img : "assets/img/real-estate/catalog/08.jpg"},
        {img : "assets/img/real-estate/catalog/08.jpg"}
      ],
    sale: 'For rent',
    title: "Greenpoint Rentals | 85 sq.m",
    address: "1510 Castle Hill Ave Bronx, NY 10462",
    price: "1,350",
    bad: "2",
    bath: "1",
    car: "0",
    location:"New York",
    district:"Manhattan",
    property:"Rentals",
    metres:"85",
    pents:"allow-dogs",
    amenities:"garage"
  },
  {
    verified_btn: 'Verified',
    btn: "",
    btn_color: "",
    image: [
        {img : "assets/img/real-estate/catalog/09.jpg"},
        {img : "assets/img/real-estate/catalog/09.jpg"}
      ],
    sale: 'For rent',
    title: "Terra Nova Apartments | 85 sq.m",
    address: "21 India St Brooklyn, NY 11222",
    price: "2,400",
    bad: "5",
    bath: "2",
    car: "2",
    location:"New York",
    district:"Staten Island",
    property:"Apartments",
    metres:"85",
    pents:"allow-cats",
    amenities:"gym"
  },
  {
    verified_btn: 'Verified',
    btn: "Featured",
    btn_color: "bg-danger",
    image: [
        {img : "assets/img/real-estate/catalog/10.jpg"},
        {img : "assets/img/real-estate/catalog/10.jpg"}
      ],
    sale: 'For rant',
    title: "O’Farrell Rooms | 40 sq.m",
    address: "460 E Fordham Rd Bronx, NY 10458",
    price: "550",
    bad: "2",
    bath: "1",
    car: "0",
    location:"New York",
    district:"Brooklyn",
    property:"Room",
    metres:"40",
    pents:"allow-dogs",
    amenities:"parking"
  },
  {
    verified_btn: '',
    btn: "New",
    btn_color: "bg-info",
    image: [
        {img : "assets/img/real-estate/catalog/11.jpg"},
        {img : "assets/img/real-estate/catalog/11.jpg"}
      ],
    sale: 'For rant',
    title: "Studio | 32 sq.m",
    address: "140-60 Beech Ave Flushing, NY 11355",
    price: "680",
    bad: "1",
    bath: "1",
    car: "1",
    location:"New York",
    district:"Brooklyn",
    property:"Studio",
    metres:"32",
    pents:"allow-cats",
    amenities:"pool"
  },
  {
    verified_btn: '',
    btn: "Featured",
    btn_color: "bg-danger",
    image: [
        {img : "assets/img/real-estate/catalog/12.jpg"},
        {img : "assets/img/real-estate/catalog/12.jpg"}
      ],
    sale: 'For rant',
    title: "Mason House | 150 sq.m",
    address: "557 Grand Concourse Bronx, NY 10451",
    price: "4,000",
    bad: "3",
    bath: "2",
    car: "1",
    location:"New York",
    district:"Brooklyn",
    property:"House",
    metres:"150",
    pents:"allow-dogs",
    amenities:"camera"
  },
  {
    verified_btn: 'Verified',
    btn: "",
    btn_color: "",
    image: [
        {img : "assets/img/real-estate/catalog/13.jpg"},
        {img : "assets/img/real-estate/catalog/13.jpg"}
      ],
    sale: 'For rant',
    title: "Office | 320 sq.m",
    address: "159 20th Street Brooklyn, NY 11232",
    price: "8,000",
    bad: "2",
    bath: "1",
    car: "8",
    location:"New York",
    district:"Brooklyn",
    property:"Office",
    metres:"320",
    pents:"allow-cats",
    amenities:"wifi"
  },
  {
    verified_btn: '',
    btn: "",
    btn_color: "",
    image: [
        {img : "assets/img/real-estate/catalog/15.jpg"},
        {img : "assets/img/real-estate/catalog/15.jpg"}
      ],
    sale: 'For rant',
    title: "Lakewood Rentals | 90 sq.m",
    address: "5 Brewster Street Glen Cove, NY 11542",
    price: "1,200",
    bad: "2",
    bath: "1",
    car: "8",
    location:"New York",
    district:"Brooklyn",
    property:"Rentals",
    metres:"90",
    pents:"allow-cats",
    amenities:"laundry"
  },
  {
    verified_btn: '',
    btn: "",
    btn_color: "",
    image: [
        {img : "assets/img/real-estate/catalog/14.jpg"},
        {img : "assets/img/real-estate/catalog/14.jpg"}
      ],
    sale: 'For rant',
    title: "Crystal Apartment| 60 sq.m",
    address: "495 Henry St Brooklyn, NY 11231",
    price: "1,350",
    bad: "2",
    bath: "1",
    car: "1",
    location:"New York",
    district:"Brooklyn",
    property:"Apartment",
    metres:"60",
    pents:"allow-cats",
    amenities:"dishwasher"
  },
  {
    verified_btn: '',
    btn: "Featured",
    btn_color: "bg-danger",
    image: [
        {img : "assets/img/real-estate/catalog/16.jpg"},
        {img : "assets/img/real-estate/catalog/16.jpg"}
      ],
    sale: 'For rant',
    title: "Family Home | 120 sq.m",
    address: "67-04 Myrtle Ave Glendale, NY 11385",
    price: "4,500",
    bad: "4",
    bath: "2",
    car: "2",
    location:"New York",
    district:"Brooklyn",
    property:"House",
    metres:"120",
    pents:"allow-cats",
    amenities:"wifi"
  },
  {
    verified_btn: '',
    btn: "",
    btn_color: "",
    image: [
        {img : "assets/img/real-estate/catalog/17.jpg"},
        {img : "assets/img/real-estate/catalog/17.jpg"}
      ],
    sale: 'For rant',
    title: "Tiffany Studio | 35 sq.m",
    address: "3979 Albany Post Road Hyde Park, NY 12538",
    price: "700",
    bad: "1",
    bath: "1",
    car: "1",
    location:"Chicago",
    district:"Brooklyn",
    property:"Studio",
    metres:"35",
    pents:"allow-cats",
    amenities:"wifi"
  },
];

export { topOfferData };
