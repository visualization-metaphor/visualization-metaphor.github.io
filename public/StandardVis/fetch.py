import json
import requests


def fetchData():
    apiUrl = f"https://zam10063.zam.kfa-juelich.de/api/v1/simulation/1/2021-06-08/?all&groups=total"
    response = requests.get(apiUrl, auth=("demo", "demo"))

    if response.status_code == 200:
        covidData = response.json()["results"]
        return covidData
    else:
        print(response.content)


if __name__ == "__main__":
    apiData = []
    results = fetchData()
    data = {}

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
            data = {
                "RS": districtId,
                "infected": infected,
                "dead": dead,
                "vaccinationRate": vaccinationRate
            }
            apiData.append(data)

    with open("simulationData.json", 'w') as dataFile:
        json.dump(apiData, dataFile)


