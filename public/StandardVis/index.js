var map, polygonSeries;
var infectionState = true, vaccinationState = true, deathState = true;
let selectedDist = [];

async function apiCall() {
  let result = await axios.get("simulationData.json");
  let geojson = await axios.get("germany.geojson");
  let simulationData = [], infection = [], vaccination = [], dead = [];

  // Iterate through germany.geojson districts
  for(let district of geojson.data.features) {
    const RS = district.properties.RS;
    const matchedDistrict = result.data.find((district) => district.RS == RS);
    simulationData.push(matchedDistrict);
  }

  for (let district of simulationData) {
    if (district["infected"] > 239) {
      infection.push(239);
    }
    else {
      infection.push(district["infected"])
    }
    vaccination.push(district["vaccinationRate"])
  }

  for (let district of simulationData) {
    if (district["dead"] > 1261.1579644088906) {
      dead.push(1261.1579644088906);
    }
    else {
      dead.push(district["dead"])
    }
  }

  var maxInfection = Math.max(...infection)

  //console.log(maxInfection);
  var maxVaccination = Math.max(...vaccination)
  var maxDead = Math.max(...dead)

  var rangeI = new ReMap(0, maxInfection, 0, 1);
  var rangeV = new ReMap(0, maxVaccination, 0, 1);
  var rangeD = new ReMap(0, maxDead, 0, 1);

  drawMap(simulationData, rangeI, rangeV, rangeD);
}

function drawMap(simulationData, rangeI, rangeV, rangeD) {

  map = am4core.create("map", am4maps.MapChart); // Create a map instance

  // Set the map's geodata source to your GeoJSON file
  map.geodataSource.url = "germany.geojson"; // Replace with your GeoJSON data

  map.projection = new am4maps.projections.Mercator(); // Set the map projection (e.g., Mercator)

  // Create a polygon series
  polygonSeries = map.series.push(new am4maps.MapPolygonSeries());
  polygonSeries.useGeodata = true;

  // Set polygon data
  map.geodataSource.events.on("parseended", () => {
    polygonSeries.data = simulationData;
    polygonSeries.dataFields.RS = "RS";
    polygonSeries.dataFields.infected = "infected";
    polygonSeries.dataFields.dead = "dead";
    polygonSeries.dataFields.vaccinationRate = "vaccinationRate";
  });


  var polygonTemplate = polygonSeries.mapPolygons.template; // Set polygonTemplate to change appearance

  let twoDcolors =
    [
      ["#f3f3f3", "efdce8", "#eac5dd", "#e8b4d7", "#e6a2d0"],
      ["#dbf2e1", "#d0dcdd", "#c4c5d8", "#cbb3d4", "#d1a1cf"], // LL, ML, HL
      ["#c2f0ce", "#b0dbd1", "#9ec5d3", "#adb2d1", "#bb9fce"],
      ["#a6e9be", "#9ad7c0", "#8ec5c2", "#95aec0", "#9b97be"], // LM, MM, HM
      ["#8ae1ae", "#84d3b0", "#7ec5b1", "#7caab0", "#7a8eae"]  // LH, MH, HH
    ];

  function getBgColorsState(infectionState, vaccinationState, infected, vaccinationRate) {
    // Define a lookup table for row and column indices based on infection and vaccination rates.

    if (infectionState && !vaccinationState) {
      const j = getIndex(infected);
      return twoDcolors[0][j]
    }

    else if (!infectionState && vaccinationState) {
      const i = getIndex(vaccinationRate);
      return twoDcolors[i][0];
    }

    else if (infectionState && vaccinationState) {
      const j = getIndex(infected);
      const i = getIndex(vaccinationRate);
      return twoDcolors[i][j]
    }
    // Return the corresponding color from the twoDcolors matrix.
    return "#C3C3C3";
  }

  function getIndex(rate) {
    if (rate < 0.33) {
      //console.log(rate);
      return 0;
    } else if (rate == 0.33) {
      return 1;
    } else if (rate < 0.66) {
      return 2;
    } else if (rate == 0.66) {
      return 3;
    }
    return 4;
  }


  // configure polygon style
  polygonTemplate.adapter.add("fill", (fill, target) => {
    if (target.dataItem != undefined) {
      //console.log(target.dataItem.infected, target.dataItem.vaccinationRate);
      var remappedDead = rangeD.find(target.dataItem.dead);
      var remappedInfected = rangeI.find(target.dataItem.infected);
      var remappedVaccinated = rangeV.find(target.dataItem.vaccinationRate);

      let pattern = new am4core.CirclePattern();
      pattern.radius = 0.5;

      if (remappedDead <= 0.33) {
        pattern.width = 10;
        pattern.height = 10;
        //pattern.radius = 1.5;
      }
      else if (remappedDead <= 0.66) {
        pattern.width = 4.8;
        pattern.height = 4.8;
        //pattern.radius = 0.6;
      }
      else {
        pattern.width = 2.6;
        pattern.height = 2.6;
        //pattern.radius = 0.5;
      }

      if (deathState) {
        pattern.fill = am4core.color("black");
        pattern.backgroundFill = am4core.color(getBgColorsState(infectionState, vaccinationState, remappedInfected, remappedVaccinated));
        pattern.backgroundOpacity = 1;
        pattern.strokeWidth = 0;
        return pattern;
      }
      return am4core.color(getBgColorsState(infectionState, vaccinationState, remappedInfected, remappedVaccinated));
    }
    return fill;
  })

  polygonTemplate.adapter.add("stroke", (stroke,target) => {
    if (selectedDist.includes(target.dataItem.RS)) {
      //console.log(target.dataItem);
      return am4core.color("#ED1C24");
    }
    else {
      return stroke;
    }
  })

  polygonTemplate.adapter.add("strokeWidth", (strokeWidth,target) => {
    if (selectedDist.includes(target.dataItem.RS)) {
      //console.log(target.dataItem);
      return 3.5;
    }
    else {
      return strokeWidth;
    }
  })

  polygonTemplate.strokeWidth = 1; // Stroke width
  polygonTemplate.tooltipText = "{GEN}"; // Tooltip text (showing the name of the region)
  polygonSeries.tooltip.autoTextColor = false;
  polygonSeries.tooltip.getFillFromObject = false;
  polygonSeries.tooltip.background.fill = am4core.color("#000000b3");
  polygonSeries.tooltip.label.fill = am4core.color("#ffffff"); // Tooltip text (showing the name of the region) 

  map.zoomControl = new am4maps.ZoomControl();
  map.zoomControl.align = "left";
  map.zoomControl.valign = "top";

  var homeButton = map.chartContainer.createChild(am4core.Button);
  homeButton.label.html = '<i class="fa-solid fa-location-crosshairs"></i>';
  homeButton.padding(5, 5, 5, 5);
  homeButton.width = 30;
  homeButton.align = "right";
  homeButton.marginRight = 15;
  homeButton.events.on("hit", function () {
    map.goHome();
  });

};

function checkInfectionState(self) {
  infectionState = $(self).prop("checked");
  //console.log(infectionState);
  // Invalidate the map's series template to trigger the adapter
  map.dispose();
  apiCall();
  //polygonSeries.data = result["data"];
  //map.invalidateRawData();
}

function checkVaccinationState(self) {
  vaccinationState = $(self).prop("checked");
  //console.log(vaccinationState);
  // Invalidate the map's series template to trigger the adapter
  map.dispose();
  apiCall();
  //polygonSeries.data = result["data"];
  //map.invalidateRawData();
}

function checkDeathState(self) {
  deathState = $(self).prop("checked");

  map.dispose();
  apiCall();
}

// District Selector
async function initSelector() {
  const response = await axios.get('district.json');
  const districtData = response.data;
  const districts = [];

  for (let district of districtData) {
      districts.push({ id: district.RS, text: district.GEN });
  }

  $("#districtSelector").select2({
      data: districts,
      placeholder: "Search Districts",
      maximumSelectionLength: 3
  });

  $("#districtSelector").on("change", () => {
      const selections = $('#districtSelector').select2("data");
      //console.log(selections);
      selectedDist = selections.map((district) => district.id);
      map.dispose();
      apiCall();
      //console.log(selectedDist);
  });
}

initSelector();
apiCall();