import { prisma } from "#utils/constants.js";
// Node Module Imports

// Local Imports
import { hashPassword } from "#utils/auth-utils.js";

// Seed Data to import
import serviceJson from "#dev-seed/updatedServices.json" with { type: "json" };
import nonprofitJson from "#dev-seed/nonprofits.json" with { type: "json" };
import employees from "#dev-seed/employees.json" with { type: "json" };
import formatAddress from "#utils/search/address-utils.js";


async function main() {
  const currentServices = await prisma.service.findMany();
  const currentNonprofits = await prisma.nonprofit.findMany();

  // Delete all existing data
  await deleteAll();


  // Get the Service Data ready for seeding
  let serviceList = await addLocationInformation(serviceJson, currentServices)  // Format the address info for services
  // Get starting and ending indices for each nonprofit's slice of services
  const serviceDistribution = [20, 20, 20, 20, 20]; // How to distribute services to nonprofits
  const [serviceStart, serviceEnd] = distribute(serviceDistribution, serviceList.length, serviceList.length);

  // Get the Employee Data ready for seeding
  const employeeList = await hashPasswordList(employees); // Hash the passwords
  // Get starting and ending indices for each nonprofit's slice of employees
  const employeeDistribution = [10, 15, 10, 5, 0]; // How to distribute employees to nonprofits
  const [employeeStart, employeeEnd] = distribute(employeeDistribution, employees.length, nonprofitJson.length);

  // Get the nonprofitData ready for seeding
  let nonprofitList = await addLocationInformation(nonprofitJson, currentNonprofits);  // Get address info for nonprofits

  let adminEmployeeList = await Promise.all(nonprofitList.map(async (nonprofit, num) => (await adminEmployee(num)))); // Create admin employees for each nonprofit

  // Create nonprofits with services and employees
  nonprofitList = nonprofitJson.map((nonprofit, num) => ({
    ...nonprofit,
    services: serviceList.slice(serviceStart[num], serviceEnd[num]),
    employees: [...employeeList.slice(employeeStart[num], employeeEnd[num]), adminEmployeeList[num]],
  }));

  try{
  // Create nonprofits and adds to database
  await Promise.all(
    nonprofitList.map(async (profitInfo) => {
      await prisma.nonprofit.create({
        data: {
          ...profitInfo,
          services:profitInfo.services? {create: profitInfo.services}:undefined,
          employees:profitInfo.employees? {create: profitInfo.employees}:undefined,
        },
      });
    })
  );
  } catch (err) {
    console.error("Error creating nonprofits:", err);
  }
}

/**
 *  Adds detailed location information to an array of objects with an address field
 * @param {object} arr - The array of objects to add location information to
 * @returns Array of objects with addressInfo field containing detailed location information
 */
async function addLocationInformation(arrayNoLocationInfo, currentData){
  let addressInfo = {}
  for(let a of currentData){
    if(a.addressInfo){
      addressInfo[a.address] = a.addressInfo
    }
  }

  let arrayWithLocationInfo = [...arrayNoLocationInfo];
  for (let i = 0; i < arrayWithLocationInfo.length; i++) {
    // See if we already have the info for that address and use it if we do
    let addressName = arrayWithLocationInfo[i].address
    if(addressInfo[addressName]){
      arrayWithLocationInfo[i].addressInfo = addressInfo[addressName]
    }else{
      let result = await  formatAddress(arrayWithLocationInfo[i].address);
      if (result.valid) {
        arrayWithLocationInfo[i].addressInfo = result.data;
      }
    }
  }
  return arrayWithLocationInfo;
}

/**
 *  Creates an admin employee
 * @param {Int} increment - The number of the nonprofit
 * @returns An admin employee with a username, password, and email
 */
async function adminEmployee(increment){
    return {username: `admin${increment}`,
     password: await hashPassword("admin"),
     email: "admin@admin.com"}
   }

/**
 * Deletes all existing data
 */
async function deleteAll(){
  // Delete all existing data
  await prisma.search_log.deleteMany();
  await prisma.web_log.deleteMany();
  await prisma.service.deleteMany();
  await prisma.nonprofit_employee.deleteMany();
  await prisma.nonprofit.deleteMany();
}

/**
 * Hash the passwords of a list of employees
 * @param {object} employees All the employees to hash the passwords of
 * @returns A list of employees with their passwords hashed
 */
async function hashPasswordList(employees){
  return await Promise.all(employees.map(async (employee) => {
    const passwordHash = await hashPassword(employee.password);
    return {...employee, password: passwordHash}})) // Hash the passwords
  }

/**
 * Gives starting and ending indices for each nonprofit's slice of objects from a # per nonprofit
 *  + If input arrays length is greater than the length of objects then the end is removed from the input array until the size is less
 *  + If the input array is longer than the number of nonprofits then the array is truncated to the number of nonprofits
 *  + If the input array is shorter than the number of nonprofits then the array is padded with 0s
 *  + The last element of the array is set to the max length of objects
 * Example Input: [20, 10, 5, 5]
 * Example Output: [[0,20,30,35], [20,30,35,40]]
 * @param {Array} lensToDistribute -  The objects to distribute
 * @param {Int} maxLength - maxLength The total length of objects
 * @returns [Int Array, Int Array] - A starting and ending index for each nonprofit's slice of objects
 */
function distribute(lensToDistribute, maxLength, nonProfitLength) {
  let distributeLens = [...lensToDistribute];
  //Make sure the total length of objects is less than the max length
  while (distributeLens.reduce((acc, val) => acc + val, 0) > maxLength) {
    distributeLens.pop();
  }

  // Make sure there is an index for each nonprofit
  if( nonProfitLength > distributeLens.length){
    for (let i = distributeLens.length; i < nonProfitLength; i++) {
      distributeLens.push(0);
    }
  }else if (nonProfitLength < distributeLens.length){
    distributeLens = distributeLens.slice(0, nonProfitLength);
  }

  // Make sure the full length of objects is assigned
  const arrStartTotal = distributeLens.slice(0,-1).reduce((acc, val) => acc + val, 0); // The total length of objects not including the last one
  distributeLens[distributeLens.length-1] = maxLength - arrStartTotal // Makes the last index take the rest of the objects

  // The start and end indices of each nonprofit's slice of objects
  // Create the end array by adding the previous value to the current value
  let endArr = [];
  for (let a = 0; a < distributeLens.length; a++) {
    const newVal = a===0 ? distributeLens[a]: endArr[a-1]+distributeLens[a];
    endArr.push(newVal);
  }
  // Create the start array by adding 0 to the first value and the previous value to the current value
  const startArr = [0, ...endArr.slice(0, -1)]
  return [startArr, endArr]
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    // Helpful to have console.err here as seed does fail occasionally and I want to know the error message so I can fix it.
    // That message will also never be shown to the user as:
    //  + It is server side
    //  + We should never be seeding with live users
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
