import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { GoverneratCommuneService } from '../../../services/governerat-commune.service';

@Component({
  selector: 'app-search-country',
  templateUrl: './search-country.component.html',
  styleUrls: ['./search-country.component.css']
})
export class SearchCountryComponent {
  @Output() citySelected = new EventEmitter<{name: string, id: number}>();

  config = {
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    dots: true,
    arrows: true,
    draggable: false,
    swipe: false,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } }
    ]
  };

  cityData = [
    {
      image: "assets/img/real-estate/city/tunis.jpg",
      title: "Tunis",
      sale_progressbar: 40,
      sale_count: "1023",
      rent_progressbar: 70,
      rent_count: "2560",
      gouvernoratId: 2
    },
    {
      image: "assets/img/real-estate/city/sousse.jpg",
      title: "Sousse",
      sale_progressbar: 35,
      sale_count: "540",
      rent_progressbar: 65,
      rent_count: "1980",
      gouvernoratId: 20
    },
    {
      image: "assets/img/real-estate/city/sfax.jfif",
      title: "Sfax",
      sale_progressbar: 30,
      sale_count: "720",
      rent_progressbar: 80,
      rent_count: "2200",
      gouvernoratId: 17
    },
    {
      image: "assets/img/real-estate/city/nabeul.jpg",
      title: "Nabeul",
      sale_progressbar: 50,
      sale_count: "430",
      rent_progressbar: 75,
      rent_count: "1400",
      gouvernoratId: 1
    },
    {
      image: "assets/img/real-estate/city/djerba.jpg",
      title: "Djerba",
      sale_progressbar: 45,
      sale_count: "860",
      rent_progressbar: 85,
      rent_count: "3000",
      gouvernoratId: 24
    },
    {
      image: "assets/img/real-estate/city/mahdia.jpg",
      title: "Mahdia",
      sale_progressbar: 45,
      sale_count: "860",
      rent_progressbar: 85,
      rent_count: "3000",
      gouvernoratId: 13
    },
    {
      image: "assets/img/real-estate/city/monastir.jpg",
      title: "Monastir",
      sale_progressbar: 45,
      sale_count: "860",
      rent_progressbar: 85,
      rent_count: "3000",
      gouvernoratId: 5
    },
    {
      image: "assets/img/real-estate/city/kairouan.jpg",
      title: "Kairouan",
      sale_progressbar: 45,
      sale_count: "860",
      rent_progressbar: 85,
      rent_count: "3000",
      gouvernoratId:10
    },
    {
      image: "assets/img/real-estate/city/touzer.jpg",
      title: "Touzer",
      sale_progressbar: 45,
      sale_count: "860",
      rent_progressbar: 85,
      rent_count: "3000",
      gouvernoratId: 22
    }
  ];

  constructor(private router: Router,private governeratCommuneService: GoverneratCommuneService ) {}

  selectCity(city: any) {
    this.governeratCommuneService.setSelectedCity({
      name: city.title,
      id: city.gouvernoratId
    });
  }
  }
