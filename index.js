// eslint-disable-next-line @typescript-eslint/no-var-requires
const { readFileSync, writeFileSync } = require('fs');
const { v4: uuidv4 } = require('uuid');

const rawData = readFileSync('locations.json');
const locations = JSON.parse(rawData);

const data = [];

locations.forEach((location) => {
  const provinceCode = location.village_code.toString().substring(0, 1);
  const provinceExist = data.findIndex(
    (province) => province.code == provinceCode
  );

  // Top level search for province data
  if (provinceExist == -1) {
    const provinceData = {
      id: uuidv4(),
      type: 'PROVINCE',
      name: location.province_name,
      code: location.province_code.toString(),
    };

    data.push(provinceData);

    // Search for district data
    const districts = locations.filter(
      (loc) => loc.province_code == provinceCode
    );

    districts.forEach((locationByDistrict) => {
      const districtCode = locationByDistrict.village_code
        .toString()
        .substring(0, 3);
      const districtExist = data.findIndex(
        (district) => district.code == districtCode
      );

      if (districtExist == -1) {
        const districtData = {
          id: uuidv4(),
          type: 'DISTRICT',
          name: locationByDistrict.district_name,
          code: locationByDistrict.district_code.toString(),
          parentId: provinceData.id,
        };
        data.push(districtData);

        // Search for sectors data
        const sectors = locations.filter(
          (sectorLocation) => sectorLocation.district_code == districtData.code
        );

        sectors.forEach((locationBySector) => {
          const sectorCode = '0'.concat(
            locationBySector.village_code.toString().substring(0, 5)
          );
          const sectorExist = data.findIndex(
            (sector) => sector.code == sectorCode
          );

          if (sectorExist == -1) {
            const sectorData = {
              id: uuidv4(),
              type: 'SECTOR',
              name: locationBySector.sector_name,
              code: locationBySector.sector_code.toString(),
              parentId: districtData.id,
            };
            data.push(sectorData);

            // Search for cells
            const cells = locations.filter(
              (cellLocation) => cellLocation.sector_code == sectorData.code
            );

            cells.forEach((locationByCell) => {
              const cellCode = locationByCell.village_code
                .toString()
                .substring(0, 7);

              const cellExist = data.findIndex((cell) => cell.code == cellCode);

              if (cellExist == -1) {
                const cellData = {
                  id: uuidv4(),
                  type: 'CELL',
                  name: locationByCell.cell_name,
                  code: locationByCell.cell_code.toString(),
                  parentId: sectorData.id,
                };
                data.push(cellData);

                // Organize data for villages
                const villages = locations.filter(
                  (villageLocation) =>
                    villageLocation.cell_code == cellData.code
                );

                villages.forEach((locationByVillage) => {
                  const villageCode = locationByVillage.village_code;

                  const villageExist = data.findIndex(
                    (village) => village.code == villageCode
                  );

                  if (villageExist == -1) {
                    const villageData = {
                      id: uuidv4(),
                      type: 'VILLAGE',
                      name: locationByVillage.village_name,
                      code: locationByVillage.village_code.toString(),
                      parentId: cellData.id,
                    };
                    data.push(villageData);
                  }
                });
              }
            });
          }
        });
      }
    });
  }
});

writeFileSync(`${Date.now()}.json`, JSON.stringify(data));
