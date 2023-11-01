import * as d3 from "d3";
import $ from "jquery";
import { Remap, findAverage } from "./uitls.js";

export class Thunderstorm {

    constructor(ctx, transform) {
        this.ctx = ctx;
        this.transform = transform;

        this.thunderstormParams = [];
        this.maxCloudSize = 8;
        this.sizeFactor = 0.001;
        this.TOTAL_LIGHTNING_DURATION = 5 * 1000;
        this.MAX_DEATH_RATE = 1261.1579644088906 //1696.2600733768202;

        this.cloud = new Path2D("M46.5 31.5h-.32a10.49 10.49 0 00-19.11-8 7 7 0 00-10.57 6 7.21 7.21 0 00.1 1.14A7.5 7.5 0 0018 45.5a4.19 4.19 0 00.5 0v0h28a7 7 0 000-14z");
        this.lightning = new Path2D("M30 36l-4 12h4l-2 10 10-14h-6l4-8h-6z");
        this.sun = new Path2D();
        this.sun.arc(19, 24, 5, 0, 2 * Math.PI);

        const sunRays = new Path2D("M19 15.67V12.5m0 23v-3.17m5.89-14.22l2.24-2.24M10.87 32.13l2.24-2.24m0-11.78l-2.24-2.24m16.26 16.26l-2.24-2.24M7.5 24h3.17m19.83 0h-3.17");
        this.sun.addPath(sunRays);

        this.isLightningEnabled = true
        this.isSunEnabled = true;

    }

    updateTransform(transform) {
        this.transform = transform;
    }

    remapDeathRate(data) {
        // Destructure array of objects into an array of death rates
        const deathRates = Object.values(data)
            .map(districtData => districtData.dead)
            .map(deathRate => deathRate > this.MAX_DEATH_RATE ? this.MAX_DEATH_RATE : deathRate);       

        const maxDeathRate = Math.max(...deathRates);
        this.rangeD = new Remap(0, maxDeathRate, 0, 1);

        //const sortedInfection = deathRates.sort((a,b)=> b-a);
        //console.log(sortedInfection);
    }

    
    remapVaccinationRate(data) {
        // Destructure array of objects into an array of vaccination rates
        const vaccinationRates = Object.values(data).map(districtData => districtData.vaccinationRate);

        //const sortedInfection = vaccinationRates.sort((a,b)=> b-a);
        //console.log(sortedInfection);

        const maxVaccinationRate = Math.max(...vaccinationRates);
        this.rangeV = new Remap(0, maxVaccinationRate, 0, 1);
    }


    initDistrict(districtGeometry, centroid, deathRate, vaccinationRate) {
        const areaInSteratidan = d3.geoArea(districtGeometry);
        const areaInDegrees = areaInSteratidan * ((180 / Math.PI) ** 2);
        const proportionalSize = areaInDegrees / this.sizeFactor;
        const size = Math.min(proportionalSize, this.maxCloudSize) / 32;

        const x = centroid[0] - size / 2*64;
        const y = centroid[1] - size / 2*64;

        // For lightning (Death rate)
        const remappedDead = this.rangeD.find(deathRate);
        let lightningDuration, lightningArcs;

        if(remappedDead <= 0.33) {
            lightningDuration = 1.5; // In seconds
            lightningArcs = 1;
        }
        else if(remappedDead <= 0.66) {
            lightningDuration = 3;
            lightningArcs = 2;
        }
        else {
            lightningDuration = 4.5;
            lightningArcs = 3;
        }

        const dOpacity = 1 / (lightningDuration * 1000); // Rate of change of opacity from 1 to 0 for every millisecond

        // For sun (Vaccination rate)
        const remappedVaccinated = this.rangeV.find(vaccinationRate);
        let sunTranslation;

        if(remappedVaccinated <= 0.33) {
            sunTranslation = 3; // In pixels
        }
        else if(remappedVaccinated <= 0.66) {
            sunTranslation = 5;
        }
        else {
            sunTranslation = -6;
        }


        this.thunderstormParams.push({ x, y, size, dOpacity, sunTranslation, lightningArcs });
    }


    draw(frameTime = 0) {

        if($("#dead").length > 0) {
            this.isLightningEnabled = $("#dead").prop("checked")
        }
        
        if($("#vaccinated").length > 0) {
            this.isSunEnabled = $("#vaccinated").prop("checked");
        }
        
        for (let params of this.thunderstormParams) {
            const { x, y, size, dOpacity, sunTranslation, lightningArcs } = params;
            let opacity = 1 - (dOpacity * frameTime);
            if(opacity < 0) {
                opacity = 0;
            }
    
            // Colors
            const cloudColor = "#00546E";
            const sunColor = "#F68706";
            const lightningArcColor =`rgba(255, 215, 0, ${opacity})`;
            const lightningColor = `rgba(255, 251, 0, ${opacity})`;
    
            // Similarity transformation
            const { translateX, translateY, scale } = this.similarityTransform(x, y, size);
    
            this.ctx.save();
    
            this.ctx.translate(translateX, translateY);
            this.ctx.scale(scale, scale);
    
            // Sun above cloud
            if(sunTranslation == 5) {
                // Cloud
                this.ctx.beginPath();
                this.ctx.fillStyle = cloudColor;
                this.ctx.fill(this.cloud);
    
                if(this.isSunEnabled) {
                    // Sun
                    this.ctx.save();
                    this.ctx.beginPath();
                    this.ctx.translate(sunTranslation, sunTranslation);
                    this.ctx.fillStyle = sunColor;
                    this.ctx.strokeStyle = sunColor;
                    this.ctx.lineWidth = 2;
                    this.ctx.lineCap = "round";
                    this.ctx.fill(this.sun);
                    this.ctx.stroke(this.sun);
                    this.ctx.restore();
                }
            }
            else {
                // Sun below cloud
                if(this.isSunEnabled) {
                    // Sun
                    this.ctx.save();
                    this.ctx.beginPath();
                    this.ctx.translate(sunTranslation, sunTranslation);
                    this.ctx.fillStyle = sunColor;
                    this.ctx.strokeStyle = sunColor;
                    this.ctx.lineWidth = 2;
                    this.ctx.lineCap = "round";
                    this.ctx.fill(this.sun);
                    this.ctx.stroke(this.sun);
                    this.ctx.restore();
                }
                
                // Cloud
                this.ctx.beginPath();
                this.ctx.fillStyle = cloudColor;
                this.ctx.fill(this.cloud);
            }
            
            // Lightning
            if(this.isLightningEnabled) {
                // Lightning arcs
                this.drawLightningArcs(lightningArcs, lightningArcColor);

                this.ctx.beginPath();
                this.ctx.fillStyle = lightningColor;
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = lightningColor;
                this.ctx.shadowOffsetX = -5;
                this.ctx.shadowOffsetY = -10;
                this.ctx.fill(this.lightning);
            }
            
            this.ctx.restore();
        }
    }

    drawLightningArcs(count, color) {
        const xValues = [32, 18, 46];
        const yValues = [30, 38, 38];
        
        for(let i=0; i<count; i++) {
            const arcX = xValues[i];
            const arcY = yValues[i];

            this.ctx.beginPath();
            this.ctx.arc(arcX, arcY, 5, 30 * Math.PI/180,  150 * Math.PI/180);
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = color;
            this.ctx.stroke();
        }
    }

    similarityTransform(x, y, size) {
        const translateX = (this.transform.k * x) + this.transform.x;
        const translateY = (this.transform.k * y) + this.transform.y;
        const scale = size * this.transform.k;

        return { translateX, translateY, scale };
    }
    
}