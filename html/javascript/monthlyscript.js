   //------------------------------ GENERAL FUNCTION ----------------------------------
   const DataUrl = 'http://localhost:3000/data';
            
   // Ambil data dari json
   function fetchData(url) {
       return fetch(url)
           .then(response => {
               if (!response.ok) {
                   throw new Error('Network response was not ok');
               }
               return response.json();
           })
           .catch(error => {
               console.error('There was a problem with the fetch operation:', error);
           });
   }


//------------------------------ SCORE CARD FUNCTION ----------------------------------
function isiDropdownFilter(selectElement, items) {
   if (Array.isArray(items)) {
       items.forEach(function(item) {
           const option = document.createElement('option');
           option.value = item;
           option.textContent = item;
           selectElement.appendChild(option);
       });
   } else {
       console.error('Expected an array but got:', items);
   }
}

// Populasi dropdowns dengan nilai unik dari data
function populateDropdowns(data) {
   const states = [...new Set(data.map(row => row.State))];
   const categories = [...new Set(data.map(row => row.Category))];
   const segments = [...new Set(data.map(row => row.Segment))];

   isiDropdownFilter(document.getElementById('stateSelect'), states);
   isiDropdownFilter(document.getElementById('categorySelect'), categories);
   isiDropdownFilter(document.getElementById('segmentSelect'), segments);
}

// Ambil value Filter
function applyFilters(data) {
   const selectedState = document.getElementById('stateSelect').value;
   const selectedCategory = document.getElementById('categorySelect').value;
   const selectedSegment = document.getElementById('segmentSelect').value;

   return data.filter(row => {
       return (!selectedState || row.State === selectedState) &&
           (!selectedCategory || row.Category === selectedCategory) &&
           (!selectedSegment || row.Segment === selectedSegment);
   });
}

// Hitung Total Sales
function calculateTotalSales(data) {
   let totalSales = 0;
   data.forEach(row => {
       const sales = parseFloat(row.Sales.replace(/\$/g, '').replace(/,/g, ''));
       totalSales += sales;
   });
   return totalSales;
}

// Hitung Total Profit
function calculateTotalProfit(data) {
   let totalProfit = 0;
   data.forEach(row => {
       const profit = parseFloat(row.Profit.replace(/\$/g, '').replace(/,/g, ''));
       totalProfit += profit;
   });
   return totalProfit;
}

// Hitung Total Orders
function calculateTotalOrders(data) {
   return data.length;
}

// Post To Card
function postDataCard() {
   fetchData(DataUrl).then(data => {
       const filteredData = applyFilters(data);

       const totalOrder = calculateTotalOrders(filteredData);
       const formattedTotalOrder = totalOrder.toLocaleString('en-US');
       document.getElementById('cardOrder').innerText = `${formattedTotalOrder}`;

       // Total Sales
       const totalSales = calculateTotalSales(filteredData);
       const formattedTotalSales = totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
       document.getElementById('cardSales').innerText = `$ ${formattedTotalSales}`;

       // Total Profit
       const totalProfit = calculateTotalProfit(filteredData);
       const formattedTotalProfit = totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
       document.getElementById('cardProfit').innerText = `$ ${formattedTotalProfit}`;

       // Profit Ratio
       const profitRatio = (totalProfit / totalSales) * 100;
       const formattedTotalProfitRatio = Math.round(profitRatio).toLocaleString('en-US');
       document.getElementById('cardProfitRatio').innerText = `${formattedTotalProfitRatio} %`;
   });
}

//------------------------------------------------- KALAU MAU TAMBAH CHART DISINI!!!!! ------------------------------------------------

//------------------------------------------------- CHART TOTAL SALES DAN PROFIT ROW 1 LEFT------------------------------------------------
// Proses dan buat diagram
fetchData(DataUrl).then(data => {
    // Asumsikan data adalah array dari pesanan
    let totalPenjualan = 0;
    let totalProfit = 0;

    data.forEach(pesanan => {
        // Hapus '$' dan ',' dari string penjualan dan profit, lalu konversi ke float
        let penjualan = parseFloat(pesanan.Sales.replace(/[$,]/g, ''));
        let profit = parseFloat(pesanan.Profit.replace(/[$,]/g, ''));

        totalPenjualan += penjualan;
        totalProfit += profit;
    });

    // Buat diagram batang
    const ctx = document.getElementById('totalChart').getContext('2d');
    const totalChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Total Penjualan', 'Total Profit'],
            datasets: [{
                label: 'Penjualan',
                data: [totalPenjualan, 0], // Penjualan pada label pertama
                backgroundColor: 'orange',
                borderColor: 'orange',
                borderWidth: 1
            }, {
                label: 'Profit',
                data: [0, totalProfit], // Profit pada label kedua
                backgroundColor: 'black',
                borderColor: 'black',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: 'black'
                    }
                }
            }
        }
    });
});

// ------------------------------------- BARCHART 10 STATE HIGHEST SALES ROW 1 RIGHT -------------------------------------
// Fungsi untuk memproses data penjualan dan mendapatkan negara bagian dengan penjualan tertinggi
// Fetch data from the URL
fetchData(DataUrl).then(data => {
    if (!data) return;

    // Process data to aggregate sales by state
    const stateSales = {};

    data.forEach(order => {
        const state = order.State;
        const sales = parseFloat(order.Sales.replace(/[^0-9.-]+/g, ""));

        if (!stateSales[state]) {
            stateSales[state] = 0;
        }

        stateSales[state] += sales;
    });

    // Convert the stateSales object into an array of [state, sales] pairs
    const salesArray = Object.entries(stateSales);

    // Sort the array by sales in descending order and take the top 10 states
    const top10Sales = salesArray.sort((a, b) => b[1] - a[1]).slice(0, 10);

    // Separate the top 10 states and their sales into separate arrays
    const states = top10Sales.map(item => item[0]);
    const sales = top10Sales.map(item => item[1]);

    // Create the bar chart using Chart.js
    const ctx = document.getElementById('salesChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: states,
            datasets: [{
                label: 'Sales by State',
                data: sales,
                backgroundColor: 'orange',
                borderColor: 'orange',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
});

//-------------------------------- TABEL SHIPMODE ----------------------------------
let totalProfitTable = {}; // Define totalProfitTable globally
let sortedShipModes = [];
let sortDirection = 'desc'; // Initialize sort direction

// Fungsi untuk memproses data profit berdasarkan kategori dan ship mode
function calculateTotalProfitTable(orders) {
    const totalProfit = {};

    orders.forEach(order => {
        const category = order["Category"];
        const shipMode = order["Ship Mode"];
        const profit = parseFloat(order.Profit.replace(/[^0-9.-]+/g, ''));

        if (!totalProfit[shipMode]) {
            totalProfit[shipMode] = { "Office Supplies": 0, "Technology": 0, "Furniture": 0 };
        }

        if (category === "Technology" || category === "Office Supplies" || category === "Furniture") {
            totalProfit[shipMode][category] += profit;
        }
    });

    return totalProfit;
}

// Fungsi untuk menampilkan data pada tabel
function displayProfitTable(totalProfitTable) {
    const tableBody = document.getElementById('profitpercategory-body');

    // Kosongkan isi tabel sebelum menambahkan data baru
    tableBody.innerHTML = '';

    // Tambahkan baris untuk setiap ship mode
    sortedShipModes.forEach(shipMode => {
        const row = `<tr>
                        <td>${shipMode}</td>
                        <td>${totalProfitTable[shipMode]["Office Supplies"].toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                        <td>${totalProfitTable[shipMode]["Technology"].toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                        <td>${totalProfitTable[shipMode]["Furniture"].toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                    </tr>`;
        tableBody.innerHTML += row;
    });
}

// Fungsi untuk mengurutkan data berdasarkan total profit
function sortShipModes(totalProfitTable, direction) {
    const shipModes = Object.keys(totalProfitTable);

    shipModes.sort((a, b) => {
        const totalProfitA = totalProfitTable[a]["Technology"] + totalProfitTable[a]["Office Supplies"] + totalProfitTable[a]["Furniture"];
        const totalProfitB = totalProfitTable[b]["Technology"] + totalProfitTable[b]["Office Supplies"] + totalProfitTable[b]["Furniture"];
        return direction === 'asc' ? totalProfitA - totalProfitB : totalProfitB - totalProfitA;
    });

    return shipModes;
}

// Fungsi untuk mengambil data dan memperbarui tabel
function fetchDataAndRenderTable() {
    fetch(DataUrl)
        .then(response => response.json())
        .then(data => {
            totalProfitTable = calculateTotalProfitTable(data);
            sortedShipModes = sortShipModes(totalProfitTable, sortDirection);
            displayProfitTable(totalProfitTable);
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Inisialisasi data dan render tabel saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    fetchDataAndRenderTable();
});

// Fungsi Filter Tabel
function filterTable() {
    fetchData(DataUrl).then(data => {
        const filteredData = applyFilters(data);
        // Use the global total Profit Table variable
        totalProfitTable = calculateTotalProfitTable(filteredData);
        displayProfitTable(totalProfitTable);
    });
}
//-------------------------------- LINE CHART MONTHLY SALES PERFORMANCE ROW 2 ----------------------------------
// Fungsi untuk memproses data penjualan bulanan
const preprocessData = (data) => {
    const result = {};

    data.forEach(order => {
        const date = new Date(order["Order Date"]);
        const month = date.toLocaleString('default', { month: 'long' });

        if (!result[month]) {
            result[month] = { sales: 0 };
        }

        result[month].sales += parseFloat(order.Sales.replace(/[^0-9.-]+/g, ""));
    });

    const sortedData = [];

    Object.keys(result).sort((a, b) => {
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return months.indexOf(a) - months.indexOf(b);
    }).forEach(month => {
        sortedData.push({
            month: month,
            sales: result[month].sales
        });
    });

    return sortedData;
};

// Konfigurasi line chart untuk penjualan bulanan
const createLineChart = (processedData) => {
    const labelsMonth = processedData.map(data => data.month);
    const sales = processedData.map(data => data.sales);

    const ctxLSP = document.getElementById('LineChartMonthlySales').getContext('2d');
    new Chart(ctxLSP, {
        type: 'line',
        data: {
            labels: labelsMonth,
            datasets: [
                {
                    label: 'Sales',
                    data: sales,
                    backgroundColor: 'rgba(255, 143, 0, 1)',
                    borderColor: 'rgba(255, 143, 0, 1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.2,
                }
            ]
        },
        options: {
            responsive: true, 
            maintainAspectRatio: false, 
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Amount ($)'
                    }
                }
            }
        }
    });
};

// Fetching data dari JSON
fetch(DataUrl)
    .then(response => response.json())
    .then(data => {
        const processedDataLineChart = preprocessData(data);
        createLineChart(processedDataLineChart);
    })
    .catch(error => console.error('Error fetching data:', error));

    //------------------------------------------------ Most Profitable Category ROW 3 LEFT ------------------------------------------------
// Proses dan buat diagram
fetchData(DataUrl).then(data => {
    // Objek untuk menyimpan total penjualan dan profit per kategori
    const categories = {};

    data.forEach(pesanan => {
        const category = pesanan.Category;

        // Hapus '$' dan ',' dari string penjualan dan profit, lalu konversi ke float
        const penjualan = parseFloat(pesanan.Sales.replace(/[$,]/g, ''));
        const profit = parseFloat(pesanan.Profit.replace(/[$,]/g, ''));

        // Jika kategori belum ada, inisialisasi dengan nilai awal
        if (!categories[category]) {
            categories[category] = { totalPenjualan: 0, totalProfit: 0 };
        }

        // Tambahkan penjualan dan profit ke kategori
        categories[category].totalPenjualan += penjualan;
        categories[category].totalProfit += profit;
    });

    // Ekstraksi kategori, total penjualan dan total profit ke dalam array terpisah
    const categoryLabels = Object.keys(categories);
    const totalPenjualanData = categoryLabels.map(category => categories[category].totalPenjualan);
    const totalProfitData = categoryLabels.map(category => categories[category].totalProfit);

    // Buat diagram batang horizontal
    const ctx = document.getElementById('totalCategory').getContext('2d');
    const totalCategory = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categoryLabels,
            datasets: [
                {
                    label: 'Total Penjualan',
                    data: totalPenjualanData,
                    backgroundColor: 'orange',
                    borderColor: 'range',
                    borderWidth: 1
                },
                {
                    label: 'Total Profit',
                    data: totalProfitData,
                    backgroundColor: 'black',
                    borderColor: 'black',
                    borderWidth: 1
                }
            ]
        },
        options: {
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true
                }
            }
        }
    });
});




//------------------------------------------------ The most Profitable and Highest Sales ROW 3 RIGHT------------------------------------------------
// Ambil data dari JSON
function fetchData(url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

// Fungsi untuk mengubah format data
function processData(data) {
    const products = {};
    
    // Loop melalui setiap item dalam data
    data.forEach(item => {
        const productName = item["Product Name"];
        const profit = parseFloat(item["Profit"].replace("$", "").replace(",", ""));
        const sales = parseFloat(item["Sales"].replace("$", "").replace(",", ""));
        
        // Jika nama produk sudah ada dalam objek products, tambahkan profit dan sales
        if (products[productName]) {
            products[productName].profit += profit;
            products[productName].sales += sales;
        } else { // Jika tidak, buat entri baru untuk produk tersebut
            products[productName] = {
                profit: profit,
                sales: sales
            };
        }
    });
    
    // Mengurutkan produk berdasarkan profit tertinggi
    const sortedProducts = Object.entries(products).sort((a, b) => b[1].profit - a[1].profit).slice(0, 10);

    return sortedProducts;
}

// Membuat chart
async function createChart() {
    const data = await fetchData(DataUrl);
    const processedData = processData(data);
    
    const productNames = processedData.map(item => item[0]);
    const profits = processedData.map(item => item[1].profit);
    const sales = processedData.map(item => item[1].sales);
    
    const ctx = document.getElementById('myChart').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: productNames,
            datasets: [{
                label: 'Profit',
                data: profits,
                backgroundColor: 'orange',
                borderColor: 'black',
                borderWidth: 1
            }, {
                label: 'Sales',
                data: sales,
                backgroundColor: 'black',
                borderColor: 'black',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    ticks: {
                        display: false // Menyembunyikan label di sumbu x
                    }
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}

// Panggil fungsi untuk membuat chart
createChart();

//------------------------------------------------ BARCHART SUB CATEGORY TERTINGGI SALES ROW 4 LEFT ------------------------------------------------
// Fetch data from the URL
 // Fetch data from the URL
 fetchData(DataUrl).then(data => {
    if (!data) return;

    // Process data to aggregate sales by sub-category
    const subCategorySales = {};

    data.forEach(order => {
        const subCategory = order["Sub-Category"];
        const sales = parseFloat(order.Sales.replace(/[^0-9.-]+/g, ""));

        if (!subCategorySales[subCategory]) {
            subCategorySales[subCategory] = 0;
        }

        subCategorySales[subCategory] += sales;
    });

    // Convert the subCategorySales object into an array of [subCategory, sales] pairs
    const salesArray = Object.entries(subCategorySales);

    // Sort the array by sales in descending order and take the top 10 sub-categories
    const top10Sales = salesArray.sort((a, b) => b[1] - a[1]).slice(0, 10);

    // Separate the top 10 sub-categories and their sales into separate arrays
    const subCategories = top10Sales.map(item => item[0]);
    const sales = top10Sales.map(item => item[1]);

    // Create the horizontal bar chart using Chart.js
    const ctx = document.getElementById('SubsalesChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: subCategories,
            datasets: [{
                label: 'Sales by Sub-Category',
                data: sales,
                backgroundColor: 'orange',
                borderColor: 'orange',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true
                }
            }
        }
    });
});

fetch(DataUrl)
    .then(response => response.json())
    .then(data => {
        const processedDataLineChart = preprocessData(data);
        createLineChart(processedDataLineChart);
    })
    .catch(error => console.error('Error fetching data:', error));


// ------------------------------------- BARCHART STATE HIGHEST PROFIT ROW 4 RIGHT-------------------------------------
// Fungsi untuk memproses data profit dan mendapatkan profit per negara bagian
// Fetch data from the URL
fetchData(DataUrl).then(data => {
    if (!data) return;

    // Process data to aggregate profit by state
    const stateProfit = {};

    data.forEach(order => {
        const state = order.State;
        const profit = parseFloat(order.Profit.replace(/[^0-9.-]+/g, ""));

        if (!stateProfit[state]) {
            stateProfit[state] = 0;
        }

        stateProfit[state] += profit;
    });

    // Convert the stateProfit object into an array of [state, profit] pairs
    const profitArray = Object.entries(stateProfit);

    // Sort the array by profit in descending order and take the top 10 states
    const top10Profit = profitArray.sort((a, b) => b[1] - a[1]).slice(0, 10);

    // Separate the top 10 states and their profit into separate arrays
    const states = top10Profit.map(item => item[0]);
    const profits = top10Profit.map(item => item[1]);

    // Create the bar chart using Chart.js
    const ctx = document.getElementById('profitChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: states,
            datasets: [{
                label: 'Profit by State',
                data: profits,
                backgroundColor: 'black',
                borderColor: 'black',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
});





//------------------------------------^^^^^^^ KALAU MAU TAMBAH CHART DISINI (INI BATASNYA)!!!!! ^^^^^-----------------------------------------
//------------------------------------------------ EVENT LISTENER ------------------------------------------------
// Tambah event listeners ke dropdowns
document.getElementById('stateSelect').addEventListener('change', postDataCard);
document.getElementById('categorySelect').addEventListener('change', postDataCard);
document.getElementById('segmentSelect').addEventListener('change', postDataCard);

// Fetch data, populate dropdowns, dan lakukan kalkulasi awal
fetchData(DataUrl).then(data => {
   populateDropdowns(data);
   postDataCard();
}); 