import * as d3 from 'd3';
import $ from "jquery";
import api from './api.js';
import "select2";
import 'select2/dist/css/select2.css';

export class Districts {

    constructor(ctx, transform, width, height, geojson, rainRenderer) {

        const projection = d3.geoMercator()
            .scale(2500)
            .center([10.541136, 51.1])
            .translate([width / 2, height / 2]);

        this.ctx = ctx;
        this.transform = transform;
        this.districtPathGenerator = d3.geoPath().projection(projection).context(ctx);
        this.districts = geojson.features;
        this.selectedDistricts = [];

        this.rainRenderer = rainRenderer;

        // Initialize district selector with options and select2
        this.initSelector();
    }

    updateTransform(transform) {
        this.transform = transform;
    }


    draw(animationTimestamp) {
        this.ctx.save();

        this.ctx.translate(this.transform.x, this.transform.y);
        this.ctx.scale(this.transform.k, this.transform.k);

        for (let district of this.districts) {
            const districtId = district.properties.RS;
            let strokeColor = "#9f9f9f", strokeWidth = 0.3;

            // Highlighted district
            if(this.selectedDistricts.includes(districtId)) {
                strokeColor = "#ED1C24";
                strokeWidth = 1.5;
            }

            // Draw district
            this.ctx.beginPath();
            this.districtPathGenerator(district);
            this.ctx.lineWidth = strokeWidth;
            this.ctx.strokeStyle = strokeColor;
            this.ctx.stroke();

            // Draw Rain within each district
            if (this.rainRenderer) {
                this.ctx.save();
                this.ctx.clip();
                this.ctx.beginPath();
                this.rainRenderer.draw(districtId, animationTimestamp);
                this.ctx.restore();
            }
        }
        this.ctx.restore();
    }

    // District Selector
    async initSelector() {
        const response = await api.getDistricts();
        const districtData = response.data;
        const districts = [];
        
        for(let district of districtData) {
            districts.push({ id: district.RS, text: district.GEN });
        }

        $("#districtSelector").select2({
            data: districts,
            placeholder: "Search Districts",
            maximumSelectionLength: 3
        });

        $("#districtSelector").on("change", () => {
            const selections = $('#districtSelector').select2("data");
            this.selectedDistricts = selections.map((district) => district.id);
        });
    }
}