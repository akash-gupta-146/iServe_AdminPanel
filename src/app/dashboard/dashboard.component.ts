import { Component, OnInit } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { TostService } from '../providers/tost.service';
import { DateRange } from '../interface/user';
import { Router } from '@angular/router';

declare var google: any;


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  public chart: any;

  valFalse = false;

  role: string;

  statusCount: any;

  startDate: Date;
  endDate: Date;

  statusByProductCat = [];
  stateCount = [];
  mttrTillDate = [];
  meanTiming = [];
  inWarranty = [];
  outOfWarranty = [];

  incidentAge = [];
  filter = {};
  statusCarryForward: number
  statusFixed: number
  statusNew: number;
  statusRejected: Number;
  productCategoryName: Array<any>

  filterByDate = "month";

  filterId: number;
  showRange = false;
  rating = [];
  ratingId = [];
  avgId = [];
  mttrId = [];
  warrantyId = [];
  statusIdChart = [];
  incidentId = [];
  carryforwardChart = [];
  newChart = [];
  rejectedChart = [];
  fixedChart = [];
  statusType = ['CARRYFORWARD', 'NEW', 'FIXED', 'REJECTED',];
  

  dateRange = new DateRange;
  showRatingChart = true;
  categoryName = 'ALL APPLIANCES';
  categoryType = 'parent';
  statusByProductCatIds = [];


  constructor(private dashboardservice: DashboardService,
    private tostservice: TostService,
    private router: Router,
  ) {
  }




  dashboardFilterByDate(value) {
    this.showRange = false;

    this.dateRange = new DateRange();
    this.filterByDate = value;
    this.getFilter();
    this.getCharts();

  }

  forAllProduct(value) {
    console.log(this.filterId);

    this.filterId = null;
    console.log(this.filterId);

    this.categoryName = value;
    // console.log(this.filterId)
    this.getFilter();
    this.getCharts();

  }

  filterByRange(value) {

    this.filterByDate = value;
    this.getFilter();
    this.getCharts();

  }

  getFilter() {
    this.filter = {};

    if (this.filterByDate) {
      this.filter["duration"] = this.filterByDate;

      if (this.filterByDate === "byRange") {

        this.filter["startDate"] = this.dateRange.startDate;
        this.filter["endDate"] = this.dateRange.endDate;
      }

    }



    if (this.filterId) {
      console.log(this.filterId);

      // console.log(this.filterId)
      this.filter["categoryId"] = this.filterId;
      this.categoryType = 'child';
    } else {
      this.categoryType = 'parent';

    }





  }

  filterByProduct(Category) {
    // this.getFilter(id)
    this.categoryName = Category.name;
    this.filterId = Category.id;
    this.categoryType = 'child';
    this.getFilter();
    this.getCharts();
  }


  dashboardFilterByRange() {
    this.showRange = true;

  }


  getProductCategorys() {
    this.dashboardservice.getProductCategory()
      .subscribe((res) => {
        // console.log(res)
        this.productCategoryName = res;
      })
  }



  getDashboardDetails() {
    this.dashboardservice.getDashbord(this.filter)
      .subscribe((res: any) => {
        // console.log(res);
        this.statusCarryForward = res.CARRYFORWARD;
        this.statusFixed = res.FIXED;
        this.statusNew = res.NEW;
        this.statusRejected = res.REJECTED;
      })
  }




  routeToIncidents(pc?, gtype?, type?, stid?, wrnty?, rating?) {
    this.router.navigate(['/incidents'], { queryParams: { duration: this.filterByDate, cType: this.categoryType, pcId: pc, gType: gtype, Type: type, stId: stid, warranty: wrnty, rating: rating, start: this.dateRange.startDate, end: this.dateRange.endDate, } });

  }

  get_product_rating_chart() {
    this.rating = [[]];

    this.dashboardservice.getProductRating(this.filter, this.valFalse)
      .subscribe((res: any) => {
        this.rating = [[]];
        this.ratingId = [[]]


        this.rating[0].push('rating');
        for (let i = 0; i < res[0].ratingInfo.length; i++) {
          this.rating[0].push(res[0].ratingInfo[i].name);
        }

        for (let k = 0; k < res[0].ratingInfo.length; k++) {

          // if(res[0].ratingInfo[k].categoryId){

          // }

          this.ratingId.push(res[0].ratingInfo[k].id);
          console.log(this.ratingId);
        }

        for (let i = 0; i < res.length; i++) {
          this.rating[i + 1] = [];
          this.rating[i + 1].push(res[i].rating);
          for (let j = 0; j < res[i].ratingInfo.length; j++) {
            this.rating[i + 1].push(res[i].ratingInfo[j].count);

          }

        }


        this.draw_rating_chart();


      }, (err) => {
        this.tostservice.showNotificationFailure(err);
      })
  }




  draw_rating_chart() {
    let data = google.visualization.arrayToDataTable(this.rating)


    let options = {
      height: 200,
      seriesType: 'bars',
      series: { 6: { type: 'line' } },
      legend: { position: 'top', maxLines: 6 },
      colors: ['#e91e63', '#01adc2', '#fd9710', '#4ba64f', '#9d36b3', '#FFFF00', '#AA00FF', '#9E9D24'],
    };
    let optionsPrint = {
      height: 250,
      width:950,
      chartArea:{
        width:600,
      },
      seriesType: 'bars',
      // series: { 6: { type: 'line' } },
      legend: { position: 'right', maxLines:8 },
      colors: ['#e91e63', '#01adc2', '#fd9710', '#4ba64f', '#9d36b3', '#FFFF00', '#AA00FF', '#9E9D24'],
    };

    let chart = new google.visualization.ComboChart(document.getElementById('Rating_Chart'));
    let chartPrint = new google.visualization.ComboChart(document.getElementById('Rating_ChartPrint'));
    

    google.visualization.events.addListener(chart, 'select', () => {
      var selectedItem = chart.getSelection()[0];



      if (selectedItem) {


        this.routeToIncidents(this.ratingId[selectedItem.column], 'rating', '', '', '', selectedItem.row);
      }
    });



    chart.draw(data, options);
    chartPrint.draw(data, optionsPrint);
  }




  //  incidents weekly report statrs here

  get_Product_Status() {

    this.statusByProductCat = [];
    this.dashboardservice.get_Product_Status(this.filter, this.valFalse)
      .subscribe((res: any) => {
        this.statusIdChart = [];
        this.carryforwardChart = [];
        this.newChart = [];
        this.rejectedChart = [];
        this.fixedChart = [];
        this.statusByProductCat = [];

        this.statusByProductCatIds = []

        this.carryforwardChart.push(['Product Category', 'Carryforward']);
        this.newChart.push(['Product Category', 'New']);
        this.rejectedChart.push(['Product Category', 'Rejected']);
        this.fixedChart.push(['Product Category', 'Fixed']);
        this.statusByProductCat.push(['Appliances', 'Carry Forward', 'New', 'Fixed', 'Rejected',])
        res.forEach(element => {
          this.statusByProductCat.push([element.name, element.CARRYFORWARD, element.NEW, element.FIXED, element.REJECTED,]);
          this.statusIdChart.push([element.id])
          this.carryforwardChart.push([element.name, element.CARRYFORWARD]);
          this.newChart.push([element.name, element.NEW]);
          this.rejectedChart.push([element.name, element.REJECTED]);
          this.fixedChart.push([element.name, element.FIXED]);

          this.statusByProductCatIds.push(element.id);
          // console.log(this.statusByProductCatIds);

        });

        this.product_status_Chart();
        this.carryFroward_Chart();
        this.New_chart();
        this.rejected_Chart();
        this.fixed_Chard();
      }, (err) => {
        this.tostservice.showNotificationFailure(err);
      })
  }

  product_status_Chart() {
    let data = google.visualization.arrayToDataTable(this.statusByProductCat);


    let options = {
      height: 200,


      seriesType: 'bars',
      series: { 6: { type: 'line' } },
      vAxis: {

      },

      legend: { position: 'top', maxLines: 3 },
      colors: ['#e91e63', '#01adc2', '#fd9710', '#4ba64f', '#9d36b3', '#FFFF00', '#AA00FF', '#9E9D24'],
      // animation: {
      //   "startup": true,
      //   duration: 600,
      //   easing: 'in-out'
      // }
    };

    let chart = new google.visualization.ComboChart(document.getElementById('product_status_Chart'));

    google.visualization.events.addListener(chart, 'select', () => {
      var selectedItem = chart.getSelection()[0];

      if (selectedItem) {

        this.routeToIncidents(this.statusIdChart[selectedItem.row], 'status', this.statusType[selectedItem.column - 1], '', '', '');

      }
    });



    google.visualization.events.addListener(chart, 'onmouseover', () => {

      document.getElementById('product_status_Chart').style.cursor = "pointer";
    });
    google.visualization.events.addListener(chart, 'select', () => {

    });
    chart.draw(data, options);


  }

  carryFroward_Chart() {
    var data = google.visualization.arrayToDataTable(this.carryforwardChart);

    var options = {
      chartArea: {
        width: 100,
        height: 100,

      },
      width: 80,
      height: 80,
      // top: 50,
      // is3D: true,
      legend: { position: 'none', maxLines: 8 },

      // pieSliceText:"value",
      colors: ['#e91e63', '#01adc2', '#fd9710', '#4ba64f', '#9d36b3', '#FFFF00', '#AA00FF', '#9E9D24'],

    }



    var chart = new google.visualization.PieChart(document.getElementById('CarryForward_Chart'));

    google.visualization.events.addListener(chart, 'select', () => {
      var selectedItem = chart.getSelection()[0];

      if (selectedItem) {

        this.routeToIncidents(this.statusIdChart[selectedItem.row], 'status', 'CARRYFORWARD', '', '', '');

      }
    });


    chart.draw(data, options);
  }
  New_chart() {

    var data = google.visualization.arrayToDataTable(this.newChart);

    var options = {
      chartArea:
      {
        width:100,
        height:100,
      },
      width: 80,
      height: 80,
      legend: { position: 'none', maxLines: 8 },
      colors: ['#e91e63', '#01adc2', '#fd9710', '#4ba64f', '#9d36b3', '#FFFF00', '#AA00FF', '#9E9D24'],

    }



    var chart = new google.visualization.PieChart(document.getElementById('New_Chart'));

    google.visualization.events.addListener(chart, 'select', () => {
      var selectedItem = chart.getSelection()[0];

      if (selectedItem) {

        this.routeToIncidents(this.statusIdChart[selectedItem.row], 'status', 'NEW', '', '', '');

      }
    });
    chart.draw(data, options);
  }

  fixed_Chard() {

    var data = google.visualization.arrayToDataTable(this.fixedChart);

    var options = {
      chartArea:
      {
        width: 80,
        height: 80,
      },
      width:80,
      height:80,
      legend: { position: 'none', maxLines: 8 },
      colors: ['#e91e63', '#01adc2', '#fd9710', '#4ba64f', '#9d36b3', '#FFFF00', '#AA00FF', '#9E9D24'],

    }



    var chart = new google.visualization.PieChart(document.getElementById('Fixed_Chart'));

    google.visualization.events.addListener(chart, 'select', () => {
      var selectedItem = chart.getSelection()[0];

      if (selectedItem) {

        this.routeToIncidents(this.statusIdChart[selectedItem.row], 'status', 'FIXED', '', '', '');

      }
    });
    chart.draw(data, options);
  }

  rejected_Chart() {

    var data = google.visualization.arrayToDataTable(this.rejectedChart);

    var options = {
      chartArea: {
        width: 120,
        height: 120,

      },
      width: 80,
      height: 80,
      legend: { position: 'none', maxLines: 8 },
      colors: ['#e91e63', '#01adc2', '#fd9710', '#4ba64f', '#9d36b3', '#FFFF00', '#AA00FF', '#9E9D24'],

    }



    var chart = new google.visualization.PieChart(document.getElementById('Rejected_Chart'));

    google.visualization.events.addListener(chart, 'select', () => {
      var selectedItem = chart.getSelection()[0];

      if (selectedItem) {

        this.routeToIncidents(this.statusIdChart[selectedItem.row], 'status', 'REJECTED', '', '', '');

      }
    });
    chart.draw(data, options);
  }

  getStatusByState() {
    this.stateCount = [];
    this.dashboardservice.getStateByStatus(this.filter, this.valFalse)
      .subscribe((res: any) => {
        // console.log(res)
        this.stateCount.push(['provinces', 'Open Incidents'])

        res.forEach(element => {
          this.stateCount.push([element.state, element.count])
        });
        this.regions_chart();
      }, (err) => {
        this.tostservice.showNotificationFailure(err)
      })
  }

  regions_chart() {
    {
      let data = google.visualization.arrayToDataTable(this.stateCount);

      let options = {
        height: 300,
        chartArea: {
          height: 320,
          // width: 500,
        },
        region: 'IN',
        resolution: 'provinces',
        colorAxis: { colors: ['#01bcd7'] },
        animation: {
          "startup": true,
          duration: 600,
          easing: 'in-out'
        }
      };

      let chart = new google.visualization.GeoChart(document.getElementById('regions_chart'));
      google.visualization.events.addListener(chart, 'select', () => {
        var selectedItem = chart.getSelection()[0];
        console.log(selectedItem)


        if (selectedItem) {




          this.routeToIncidents('', 'region', '', this.stateCount[selectedItem.row + 1][0], '', '');
        }
      });

      chart.draw(data, options);
    }
  }




  get_MeanTime_Till_Date() {
    this.mttrTillDate = [];

    this.dashboardservice.getAVG(this.filter, this.valFalse)
      .subscribe((res: any) => {
        this.mttrTillDate = [];

        
        this.mttrTillDate.push(['Appliances', 'Customer', 'Engineer', 'Repair', 'avg'])
        console.log(res[0]["avgResolveTimeInfo"]);
        res[0]["avgResolveTimeInfo"].forEach(element => {

          this.avgId.push([element.id])

          this.mttrTillDate.push([element.name, parseFloat(element.customer), parseFloat(element.engineer), parseFloat(element.repair), parseFloat(element.avgResolveTime)])

          //  }

        });

        this.repair_time_Till_Date();

      }, (err) => {
        this.tostservice.showNotificationFailure(err)
      }
      );


  }
  repair_time_Till_Date() {

    var data = google.visualization.arrayToDataTable(this.mttrTillDate);

    var options = {

      height: 200,
      

      seriesType: 'bars',
      series: { 3: { type: 'line' } },

      legend: { position: 'top', maxLines: 3 },
      bar: { groupWidth: '80%' },
      // isStacked: true,
      colors: ['#e91e63', '#01adc2', '#fd9710', '#4ba64f', '#9d36b3', '#FFFF00', '#AA00FF', '#9E9D24'],
      animation: {
        "startup": true,
        duration: 600,
        easing: 'in-out'
      }
    };


    var chart = new google.visualization.ComboChart(document.getElementById('repair_time'));
    google.visualization.events.addListener(chart, 'select', () => {
      var selectedItem = chart.getSelection()[0];
      console.log(selectedItem)


      if (selectedItem) {

        // routeToIncidents(pc?,gtype?,type?,stid?,wrnty?,rating?) {

        this.routeToIncidents(this.avgId[selectedItem.row], 'avg', '', '', '', '');
      }
    });




    chart.draw(data, options);
  }





  get_Out_Warranty_Status() {

    this.outOfWarranty = [];
    this.inWarranty = [];
    this.dashboardservice.getProductWarrantyStatus(this.filter, this.valFalse)
      .subscribe((res: Array<any>) => {

        this.outOfWarranty.push(["Product Name", "Count"])

        res[0]["warrantyInfo"].forEach(element => {
          this.warrantyId.push([element.id])
          this.outOfWarranty.push([element.name, element.count]);

        });




        this.inWarranty.push(["Product Name", "Count"])

        res[1]["warrantyInfo"].forEach(element => {

          this.inWarranty.push([element.name, element.count]);
        });


        this.In_Warranty_Status_chart();


        console.log(this.outOfWarranty);

        this.Out_Warranty_Status_chart();




      }, (err) => {
        this.tostservice.showNotificationFailure(err)
      }
      );


  }
  Out_Warranty_Status_chart() {

    var data = google.visualization.arrayToDataTable(this.outOfWarranty);

    var options = {
      title: ' out of warranty',
      // is3D: true,
      chartArea: {
        height: 120,

      },
      legend: { position: 'bottom', maxLines: 8 },

      // pieSliceText:"value",
      colors: ['#e91e63', '#01adc2', '#fd9710', '#4ba64f', '#9d36b3', '#FFFF00', '#AA00FF', '#9E9D24'],

    }



    var chart = new google.visualization.PieChart(document.getElementById('out_Warranty_Status'));


    google.visualization.events.addListener(chart, 'select', () => {
      var selectedItem = chart.getSelection()[0];
      console.log(selectedItem)


      if (selectedItem) {

        // routeToIncidents(pc?,gtype?,type?,stid?,wrnty?,rating?) {

        this.routeToIncidents(this.warrantyId[selectedItem.row], 'warranty', '', '', 'outsideWarranty', '');
      }
    });



    chart.draw(data, options);
  }


  In_Warranty_Status_chart() {

    var data = google.visualization.arrayToDataTable(this.inWarranty);
    var options = {
      title: 'In warranty',
      chartArea:{
length:120,
      },
     // is3D: true,
      legend: { position: 'bottom', maxLines: 8 },
      // pieSliceText: "value",
      colors: ['#e91e63', '#01adc2', '#fd9710', '#4ba64f', '#9d36b3', '#FFFF00', '#AA00FF', '#9E9D24'],

    }


    var chart = new google.visualization.PieChart(document.getElementById('in_Warranty_Status'));
    google.visualization.events.addListener(chart, 'select', () => {
      var selectedItem = chart.getSelection()[0];
      console.log(selectedItem)


      if (selectedItem) {

        // routeToIncidents(pc?,gtype?,type?,stid?,wrnty?,rating?) {

        this.routeToIncidents(this.warrantyId[selectedItem.row], 'warranty', '', '', 'inWarranty', '');
      }
    });

    chart.draw(data, options);
  }



  get_Product_Incident_Age() {
    this.incidentAge = [];
    this.dashboardservice.getProductIncidentAge(this.filter, this.valFalse)
      .subscribe((res: any) => {

        this.Product_Incident_Age_chart(res);
      }, (err) => {
        this.tostservice.showNotificationFailure(err)
      }
      );

  }
  Product_Incident_Age_chart(data: any[]) {
    this.incidentId = [];
    var dataTable: any = [[]];

    dataTable[0].push('range');
    for (let i = 0; i < data[0].ageInfo.length; i++) {
      dataTable[0].push(data[0].ageInfo[i].name);
    }

    for (let k = 0; k < data[0].ageInfo.length; k++) {
      this.incidentId.push(data[0].ageInfo[k].id);
    }

    for (let i = 0; i < data.length; i++) {
      dataTable[i + 1] = [];
      dataTable[i + 1].push(data[i].range);
      for (let j = 0; j < data[i].ageInfo.length; j++) {
        dataTable[i + 1].push(data[i].ageInfo[j].count);
      }
    }


    var data1 = google.visualization.arrayToDataTable(dataTable);
    var options = {
      height: 200,


      seriesType: 'bars',
      legend: { position: 'top', maxLines: 8 },
      colors: ['#e91e63', '#01adc2', '#fd9710', '#4ba64f', '#9d36b3', '#FFFF00', '#AA00FF', '#9E9D24'],

    };


    var chart = new google.visualization.ComboChart(document.getElementById('Product_Incident_Age'));


    google.visualization.events.addListener(chart, 'select', () => {
      var selectedItem = chart.getSelection()[0];
      console.log(selectedItem)


      if (selectedItem) {
        console.log(this.incidentId[selectedItem.column - 1]);


        this.routeToIncidents(this.incidentId[selectedItem.column - 1], 'incident-age', dataTable[selectedItem.row + 1][0], '', '', '');
      }
    });


    chart.draw(data1, options);
  }

  // mean time to repair start here
  getMeanTime() {
    // this.meanTiming=[];

    this.dashboardservice.getMTTR(this.filter, this.valFalse)
      .subscribe((res: any) => {

        this.mttrId = [];
        this.meanTiming = [[]]
        this.meanTiming[0].push('avg');
        for (let i = 0; i < res[0].mttrInfo.length; i++) {
          this.meanTiming[0].push(res[0].mttrInfo[i].name);
        }

        for (let k = 0; k < res[0].mttrInfo.length; k++) {
          this.mttrId.push(res[0].mttrInfo[k].id);
        }

        for (let i = 0; i < res.length; i++) {
          this.meanTiming[i + 1] = [];
          this.meanTiming[i + 1].push(res[i].range);
          for (let j = 0; j < res[i].mttrInfo.length; j++) {
            this.meanTiming[i + 1].push(res[i].mttrInfo[j].count);
          }
        }

        this.repair_time();
      })
  }
  repair_time() {

    var data = google.visualization.arrayToDataTable(this.meanTiming);

    var options = {
      height: 200,
      legend: { position: 'top', maxLines: 7 },
      bar: { groupWidth: '75%' },
      isStacked: true,

      colors: ['#e91e63', '#01adc2', '#fd9710', '#4ba64f', '#9d36b3', '#FFFF00', '#AA00FF', '#9E9D24'],
      animation: {
        "startup": true,
        duration: 600,
        easing: 'in-out'
      }
    };
    var optionsPrint = {
      height: 300,
chartArea:{
},
      legend: { position: 'right', maxLines:8},
      // bar: { groupWidth: '75%' },
      isStacked: true,

      colors: ['#e91e63', '#01adc2', '#fd9710', '#4ba64f', '#9d36b3', '#FFFF00', '#AA00FF', '#9E9D24'],
      animation: {
        "startup": true,
        duration: 600,
        easing: 'in-out'
      }
    };
    var chart = new google.visualization.BarChart(document.getElementById('time_to_repair'));
    var chartPrint = new google.visualization.BarChart(document.getElementById('time_to_repairPrint'));



    google.visualization.events.addListener(chart, 'select', () => {
      var selectedItem = chart.getSelection()[0];


      if (selectedItem) {



        this.routeToIncidents(this.mttrId[selectedItem.column - 1], 'mttr', this.meanTiming[selectedItem.row + 1][0], '', '', '');
      }
    });


    chartPrint.draw(data, optionsPrint);




    chart.draw(data, options);
  }

  // mean time to repair end here

















  //  all managent charts load on managment loggin
  getAllManagmentCharts() {
    google.charts.load('current', { packages: ['corechart', 'bar'] });

    google.charts.setOnLoadCallback(() => {
      this.getCharts();


    })


  }


  getCharts() {
    // this.getFilter(data,id,range);
    this.get_Product_Incident_Age();
    this.getMeanTime();
    this.getDashboardDetails();
    this.get_Product_Status();
    this.getStatusByState();
    this.get_Out_Warranty_Status();
    // this.get_In_Warranty_Status();
    this.get_MeanTime_Till_Date();
    this.getProductCategorys();
    this.get_product_rating_chart();
  }



  Test() {
    this.dashboardservice.getProductCategory()
      .subscribe((res: any) => {
        // console.log(res);
      })
  }





  today: any
  ngOnInit() {
    this.role = localStorage.getItem("currentUserName");
    this.getFilter();
    this.today = new Date()
    this.today.setDate(this.today.getDate() + 1);



    this.dashboardservice.loadScript().subscribe(
      (res) => { },
      (err) => { },
      () => {
        if (this.role == 'management') {
          this.getAllManagmentCharts();
        }

      }
    );



  }




}

