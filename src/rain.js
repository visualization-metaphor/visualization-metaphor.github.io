import { Remap, generateRandomNumber } from "./uitls.js";
import $ from "jquery";

export class Rain {

    constructor(ctx, transform) {
        this.ctx = ctx;
        this.transform = transform;
        this.rainDrop = new Path2D("M32 17c-6.09 9-10 14.62-10 20.09a10 10 0 0020 0C42 31.62 38.09 26 32 17z");
        this.dropColor = "#3392d6";
        this.MAXRAINRATE = 239 //109;

        this.rainParams = {};
    }

    updateTransform(transform) {
        this.transform = transform;
    }

    remap(data) {
        // Destructure array of objects into an array of infection rates
        const infectionRates = Object.values(data).map(districtData => districtData.infected)
        .map(a => a > this.MAXRAINRATE ? this.MAXRAINRATE : a);

        const maxInfectionRate = Math.max(...infectionRates);
        //const sortedInfection = infectionRates.sort((a,b)=> b-a);
        //console.log(sortedInfection);
        this.rangeI = new Remap(0, maxInfectionRate, 0, 1);
    }

    initDistrict(districtId, infectionRate, boundingBox) {
        const remappedInfected = this.rangeI.find(infectionRate);
        let spaceBetween, rainDuration;

        if(remappedInfected <= 0.33) {
            spaceBetween = 10; // In pixels
            rainDuration = 5000; // In milliseconds
        }
        else if(remappedInfected <= 0.66) {
            spaceBetween = 4;
            rainDuration = 3000;
        }
        else {
            spaceBetween = 2;
            rainDuration = 1000;
        }
       
        const rainFallingDistance = boundingBox.height + 10;
        const dy = rainFallingDistance / rainDuration; // No. of pixels to move per millisecond in y-direction
        this.rainParams[districtId] = { spaceBetween, rainDuration, dy, lastTimestamp: 0, boundingBox, startYList: [] };
    }


    draw(districtId, animationTimestamp) {
        if($("#infected").length > 0) {
            const isRainEnabled = $("#infected").prop("checked");
            if (!isRainEnabled) {
                return;
            }
        }
        
        const { spaceBetween, dy, rainDuration, lastTimestamp, boundingBox, startYList } = this.rainParams[districtId];
        const frameTime = animationTimestamp - lastTimestamp;

        // If current animation loop > rain render time, restart animation
        if (frameTime >= rainDuration) {
            this.rainParams[districtId].lastTimestamp = animationTimestamp;
        }

        this.render(frameTime, spaceBetween, dy, boundingBox, startYList);
    }

    render(frameTime, spaceBetween, dy, boundingBox, startYList) {

        const size = Math.min(0.15, 0.5 / this.transform.k);

        let startX = boundingBox.x;
        let endX = boundingBox.x + boundingBox.width;
        const thresholdY = (30 / 100) * boundingBox.height;

        let dropNumber = 0;
        while (startX < endX) {
            let startY;
            if (startYList.length == 0 || startYList.length - 1 < dropNumber) {
                startY = generateRandomNumber(boundingBox.y, boundingBox.y + thresholdY);
                startYList.push(startY);
            }
            else {
                startY = startYList[dropNumber];
            }
            startY += (dy * frameTime);

            this.drawDrop(startX, startY, size, "#3392d6");
            this.drawDrop(startX, startY - boundingBox.height / 2, size, "#3392d6");

            startX += spaceBetween;
            dropNumber++;
        }
    }

    drawDrop(x, y, size) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.scale(size, size);

        this.ctx.beginPath();
        this.ctx.fillStyle = this.dropColor;
        this.ctx.fill(this.rainDrop);
        this.ctx.restore();
    }
}