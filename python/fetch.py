import json
import requests
from datetime import datetime, timedelta


def fetchDataByDate(date):
    apiUrl = f"https://zam10063.zam.kfa-juelich.de/api/v1/simulation/1/{date}/?all&groups=total"
    response = requests.get(apiUrl, auth=("demo", "demo"))

    if response.status_code == 200:
        covidData = response.json()
        return covidData["results"]
    else:
        print(response.content)


def fetchData(districtId):
    apiUrl = f"https://zam10063.zam.kfa-juelich.de/api/v1/simulation/1/{districtId}/?all&groups=total&day=2021-06-08"
    response = requests.get(apiUrl, auth=("demo", "demo"))

    if response.status_code == 200:
        covidData = response.json()
        infectionRate = covidData["results"][0]["compartments"]["Infected"]
        return infectionRate
    else:
        print(response.content)


if __name__ == "__main__":
    apiData = {}
    startDate = datetime(2021, 6, 7)
    toDate = datetime(2021, 9, 4)

    while startDate <= toDate:
        currentDate = startDate.strftime("%Y-%m-%d")
        results = fetchDataByDate(currentDate)
        data = {}
        
        print("Date:", currentDate)
        for district in results:
            districtId = district["name"]
            compartments = district["compartments"]

            icu = compartments["ICU"]
            icuV1 = compartments["ICUV1"]
            icuV2 = compartments["ICUV2"]

            carrier = compartments["Carrier"]
            carrierV1 = compartments["CarrierV1"]
            carrierV2 = compartments["CarrierV2"]

            exposed = compartments["Exposed"]
            exposedV1 = compartments["ExposedV1"]
            exposedV2 = compartments["ExposedV2"]

            infected = compartments["Infected"]
            infectedV1 = compartments["InfectedV1"]
            infectedV2 = compartments["InfectedV2"]

            hospitalized = compartments["Hospitalized"]
            hospitalizedV1 = compartments["HospitalizedV1"]
            hospitalizedV2 = compartments["HospitalizedV2"]

            dead = compartments["Dead"]

            sumInfectionV = icuV1 + icuV2 + carrierV1 + carrierV2 + exposedV1 + exposedV2 + infectedV1 + infectedV2 + hospitalizedV1 + hospitalizedV2
            sumInfection = icu + carrier + exposed + infected + hospitalized
            vaccinationRate = sumInfectionV / sumInfection

            if districtId != "00000":
                data[districtId] = {
                    "infected": infected,
                    "dead": dead,
                    "vaccinationRate": vaccinationRate
                }

        apiData[currentDate] = data
        startDate += timedelta(days=1)

    with open("simulationData.json", 'w') as dataFile:
        json.dump(apiData, dataFile)

    with open("simulationDataIndent.json", 'w') as dataFile:
        json.dump(apiData, dataFile, indent=2)
