import * as d3 from 'd3';
import $ from 'jquery';
import api from './api.js';
import { Districts } from './districts.js';
import { Rain } from './rain.js';

export class App {

    constructor() {
        const canvasParent = $("canvas").parent();
        $("canvas").attr("width", canvasParent.width());

        const canvas = d3.select("canvas");
        this.ctx = canvas.node().getContext("2d");

        this.width = canvas.property("width");
        this.height = canvas.property("height");

        window.addEventListener("resize", (event) => {
            const canvasParent = $("canvas").parent();
            $("canvas").attr("width", canvasParent.width());

            this.width = canvas.property("width");
            this.height = canvas.property("height");
        });

        this.transform = { x: 0, y: 0, k: 1 };

        this.zoom = d3.zoom().on("zoom", this.onZoom.bind(this));
        canvas.call(this.zoom);

        d3.json('./assets/germany.geojson').then((geojson) => {

            this.rainRenderer = new Rain(this.ctx, this.transform);
            this.districtRenderer = new Districts(this.ctx, this.transform, this.width, this.height, geojson, this.rainRenderer);

            this.init();

            canvas.on('mousemove', (e) => {
                const x = (e.offsetX - this.transform.x) / this.transform.k;
                const y = (e.offsetY - this.transform.y) / this.transform.k;

                // Check which feature the mouse is hovering over
                for (let district of this.districtRenderer.districts) {
                    this.ctx.beginPath();
                    this.districtRenderer.districtPathGenerator(district);

                    if (this.ctx.isPointInPath(x, y)) {
                        $('#tooltip').show();
                        $('#tooltip').text(district.properties.GEN);
                        $('#tooltip').css("top", e.offsetY + "px");
                        $('#tooltip').css("left", e.offsetX + "px");
                        break
                    }
                    else {
                        $('#tooltip').text("");
                    }
                }
            });

            canvas.on('mouseout', (e) => {
                $('#tooltip').hide();
            });
        });
    }

    onZoom(e) {
        if (e) {
            this.transform = e.transform;
            this.districtRenderer.updateTransform(e.transform);
            this.rainRenderer.updateTransform(e.transform);
        }
    }


    async init() {
        const response = await api.getSimulationData();
        const simulationData = response.data;
        const dates = Object.keys(simulationData);

        const currentData = simulationData[dates[1]];

        // Init remap objects
        this.rainRenderer.remap(currentData);

        for (let district of this.districtRenderer.districts) {

            const districtId = district.properties.RS;
            const { districtPathGenerator } = this.districtRenderer;

            const bounds = districtPathGenerator.bounds(district);
            const boundingBox = {
                x: bounds[0][0],
                y: bounds[0][1],
                width: bounds[1][0] - bounds[0][0],
                height: bounds[1][1] - bounds[0][1]
            };

            // Rain
            const infectionRate = currentData[districtId].infected;
            this.rainRenderer.initDistrict(districtId, infectionRate, boundingBox);
        }

        this.render();
    }

    // Animation loop
    render(timestamp = 0) {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.districtRenderer.draw(timestamp);

        window.requestAnimationFrame(this.render.bind(this));
    }

    zoomIn() {
        d3.select('canvas')
        .transition()
        .call(this.zoom.scaleBy, 2);
    }

    zoomOut() {
        d3.select('canvas')
		.transition()
		.call(this.zoom.scaleBy, 0.5);
    }

    home() {
        d3.select('canvas')
        .transition()
        .call(this.zoom.scaleTo, 1)
        .transition()
        .call(this.zoom.translateTo, 0.5 * this.width, 0.5 * this.height);
    }
}
