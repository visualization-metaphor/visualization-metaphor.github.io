import csv
import json


movementData = {}

with open("mobility.csv") as file:
    data = csv.reader(file)
    header = next(data)
    districtIds = header[1:]

    for row in data:
        sourceId = row[0]
        values = row[1:]

        movementData[sourceId] = {}
        for (index, value) in enumerate(values):
            targetId = districtIds[index]
            movementData[sourceId][targetId] = int(value)


with open("mobility.json", "w") as file:
    json.dump(movementData, file, indent=4)
