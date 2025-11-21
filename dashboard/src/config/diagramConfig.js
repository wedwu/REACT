// export const diagramConfig = {
//   columns: [
//     {
//       color: '#29282e',
//       boxes: [
//         { id: 'server01', status: 'up', address: '127.0.0.1', deviceType: '', name: 'Config Server', statusInfo: '', layoutVariant: '2col-25-right', chartValues: [0.4, 0.5, 0.6, 0.3, 0.9, 0.7, 0, 0, 0, 0, 0, 0, 0, 0] },
//         { id: 'server02', status: 'up', address: '127.0.0.1', deviceType: '', name: 'Config Server', statusInfo: '', layoutVariant: '1x1', chartValues: [0.4, 0.5, 0.6, 0.3, 0.9, 0.7, 0.8, 0.8, 0.8, 0.8, 0.8] },
//         { id: 'server03', status: 'up', address: '127.0.0.1', deviceType: '', name: 'Config Server', statusInfo: '', layoutVariant: '4col-2row-special', chartValues: [0.4, 0.5, 0.6, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.9, 0.7, 0.8] }
//       ]
//     },

//     {
//       color: '#29282e',
//       boxes: [
//         { id: 'server11', status: 'down', address: '127.0.0.1', deviceType: '', name: 'Config Server', statusInfo: '', layoutVariant: '2x2-right-25', chartValues: [0.4, 0.5, 0.6, 0.3, 0.9, 0.7, 0.8] },
//         { id: 'server12', status: 'down', address: '127.0.0.1', deviceType: '', name: 'Config Server', statusInfo: '', layoutVariant: '2x2-right-33', chartValues: [0.4, 0.5, 0.6, 0.3, 0.9, 0.7, 0.8] },
//         { id: 'server13', status: 'down', address: '127.0.0.1', deviceType: '', name: 'Config Server', statusInfo: '', layoutVariant: '1x1', chartValues: [0.4, 0.5, 0.6, 0.3, 0.9, 0.7, 0.8] },
//         { id: 'server14', status: 'down', address: '127.0.0.1', deviceType: '', name: 'Config Server', statusInfo: '', layoutVariant: '2x2-right-33' },
//         { id: 'server15', status: 'up', address: '127.0.0.1', deviceType: '', name: 'Config Server', statusInfo: '',   layoutVariant: '2x2-right-25', chartValues: [0.4, 0.5, 0.6, 0.3, 0.9, 0.7, 0.8] },
//         { id: 'server16', status: 'up', address: '127.0.0.1', deviceType: '', name: 'Config Server', statusInfo: '',   layoutVariant: '4col-2row-special', chartValues: [0.4, 0.5, 0.6, 0.3, 0.9, 0.7, 0.8] }
//       ]
//     },

//     {
//       color: '#29282e',
//       boxes: [
//         { id: 'server21', status: 'up', address: '127.0.0.1', deviceType: '', name: 'Config Server', statusInfo: '',   layoutVariant: '1x1', chartValues: [0.4, 0.5, 0.6, 0.3, 0.9, 0.7, 0.8] },
//         { id: 'server22', status: 'up', address: '127.0.0.1', deviceType: '', name: 'Config Server', statusInfo: '',   layoutVariant: '4col-2row-special', chartValues: [0.4, 0.5, 0.6, 0.3, 0.9, 0.7, 0.8] }
//       ]
//     }
//   ],

//   devices: [
//     {
//       id: 'server21',
//       status: 'up',
//       address: '127.0.0.1',
//       deviceType: '',
//       name: 'Config Server',
//       layoutVariant:
//       '2x2-right-25',
//       chartValues: [0.4, 0.5, 0.6, 0.3, 0.9, 0.7, 0.8]
//       statusInfo: [
//         {
//           key: 'version',
//           value: '3.12'
//         },
//         {
//           key: 'engineer',
//           value: 'MMouse'
//         }        
//       ], 
//     }
//   ]

//   connections: [
//     { from: 'server01', to: 'server11', color: '#4c5e74' },
//     { from: 'server01', to: 'server12', color: '#ff5242' },
//     { from: 'server01', to: 'server13', color: '#ff5242' },
//     { from: 'server01', to: 'server14', color: '#ff5242' },

//     { from: 'server02', to: 'server15', color: '#ff5242' },

//     { from: 'server11', to: 'server21', color: '#4c5e74' },
//     { from: 'server11', to: 'server22', color: '#4c5e74' },
//     { from: 'server12', to: 'server22', color: '#ff5242' },
//     { from: 'server13', to: 'server22', color: '#ff5242' }
//   ],

//   boxMargin: 12,
//   baseBoxHeight: 150,
//   lineSpacing: 40
// };

// src/config/diagramConfig.js

export const diagramConfig = {
  boxMargin: 12,
  baseBoxHeight: 150,
  lineSpacing: 40,

  //
  // NEW FORMAT — flat device list
  // Each device must include a column number (0, 1, or 2)
  //
  devices: [
    // ---------------- COLUMN 0 ----------------
    {
      id: "server01",
      column: 0,
      status: "up",
      name: "Server 01fgfd",
      address: "10.0.0.1",
      layoutVariant: "2col-25-right",
      chartValues: [0.2, 0.4, 0.3, 0.7, 0.5, 0.8],
      statusInfo: [
        { key: "version", value: "1.1" },
        { key: "owner", value: "Ops" }
      ]
    },
    {
      id: "server02",
      column: 0,
      status: "up",
      name: "Server 02",
      address: "10.0.0.2",
      layoutVariant: "1x1",
      chartValues: [0.8, 0.7, 0.6, 0.9, 0.4],
      statusInfo: [
        { key: "version", value: "1.3" }
      ]
    },
    {
      id: "server03",
      column: 0,
      status: "up",
      name: "Server 03",
      address: "10.0.0.3",
      layoutVariant: "4col-2row-special",
      chartValues: [0.4, 0.5, 0.4, 0.3, 0.6],
      statusInfo: [
        { key: "version", value: "2.0" }
      ]
    },

    // ---------------- COLUMN 1 ----------------
    {
      id: "server11",
      column: 1,
      status: "down",
      name: "Message Node 11",
      address: "10.0.1.1",
      layoutVariant: "2x2-right-25",
      chartValues: [0.1, 0.4, 0.2, 0.1, 0.3],
      statusInfo: [
        { key: "version", value: "5.1" }
      ]
    },
    {
      id: "server12",
      column: 1,
      status: "down",
      name: "Message Node 12",
      address: "10.0.1.2",
      layoutVariant: "2x2-right-33",
      chartValues: [0.6, 0.7, 0.2, 0.1, 0.5],
      statusInfo: [
        { key: "version", value: "5.3" }
      ]
    },
    {
      id: "server13",
      column: 1,
      status: "down",
      name: "Message Node 13",
      address: "10.0.1.3",
      layoutVariant: "1x1",
      chartValues: [0.4, 0.3, 0.5, 0.2, 0.6]
    },
    {
      id: "server14",
      column: 1,
      status: "down",
      name: "Message Node 14",
      address: "10.0.1.4",
      layoutVariant: "2x2-right-33",
      chartValues: [0.2, 0.8, 0.3, 0.4, 0.1]
    },
    {
      id: "server15",
      column: 1,
      status: "up",
      name: "Message Node 15",
      address: "10.0.1.5",
      layoutVariant: "2x2-right-25",
      chartValues: [0.4, 0.5, 0.6, 0.4, 0.8]
    },
    {
      id: "server16",
      column: 1,
      status: "up",
      name: "Message Node 16",
      address: "10.0.1.6",
      layoutVariant: "4col-2row-special",
      chartValues: [0.9, 0.7, 0.8, 0.6, 0.5]
    },

    // ---------------- COLUMN 2 ----------------
    {
      id: "server21",
      column: 2,
      status: "up",
      name: "Client 01",
      address: "10.0.2.1",
      layoutVariant: "1x1",
      chartValues: [0.3, 0.4, 0.8, 0.7, 0.5]
    },
    {
      id: "server22",
      column: 2,
      status: "up",
      name: "Client 02",
      address: "10.0.2.2",
      layoutVariant: "4col-2row-special",
      chartValues: [0.9, 0.1, 0.5, 0.6, 0.8]
    }
  ],

  //
  // CONNECTIONS (unchanged)
  //
  connections: [
    { from: "server01", to: "server11", color: "#4c5e74" },
    { from: "server01", to: "server12", color: "#ff5242" },
    { from: "server01", to: "server13", color: "#ff5242" },
    { from: "server01", to: "server14", color: "#ff5242" },

    { from: "server02", to: "server15", color: "#ff5242" },

    { from: "server11", to: "server21", color: "#4c5e74" },
    { from: "server11", to: "server22", color: "#4c5e74" },

    { from: "server12", to: "server22", color: "#ff5242" },
    { from: "server13", to: "server22", color: "#ff5242" }
  ]
};

