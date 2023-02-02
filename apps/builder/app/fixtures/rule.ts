import { Rule } from '@marble-front/api/marble';

const rule = new Rule({
  consequence: { scoreIncrease: 25 },
  orGroups: [
    {
      conditions: [
        {
          value: {
            case: 'data',
            value: {
              value: {
                case: 'constant',
                value: { value: { case: 'int', value: 3 } },
              },
            },
          },
        },
        {
          value: {
            case: 'data',
            value: {
              value: {
                case: 'constant',
                value: { value: { case: 'float', value: 3.1234 } },
              },
            },
          },
        },
        {
          value: {
            case: 'data',
            value: {
              value: {
                case: 'constant',
                value: { value: { case: 'bool', value: true } },
              },
            },
          },
        },
        {
          value: {
            case: 'data',
            value: {
              value: {
                case: 'constant',
                value: { value: { case: 'bool', value: false } },
              },
            },
          },
        },
      ],
    },
    {
      conditions: [
        {
          value: {
            case: 'formulaBinary',
            value: {
              left: {
                value: {
                  case: 'data',
                  value: {
                    value: {
                      case: 'constant',
                      value: { value: { case: 'bool', value: false } },
                    },
                  },
                },
              },
              operator: 5,
            },
          },
        },
        {
          value: {
            case: 'formulaBinary',
            value: {
              left: {
                value: {
                  case: 'data',
                  value: {
                    value: {
                      case: 'constant',
                      value: { value: { case: 'bool', value: false } },
                    },
                  },
                },
              },
              operator: 5,
              right: {
                value: {
                  case: 'data',
                  value: {
                    value: {
                      case: 'constant',
                      value: { value: { case: 'bool', value: false } },
                    },
                  },
                },
              },
            },
          },
        },
        {
          value: {
            case: 'formulaBinary',
            value: {
              left: {
                value: {
                  case: 'formulaBinary',
                  value: {
                    left: {
                      value: {
                        case: 'formulaBinary',
                        value: {
                          left: {
                            value: {
                              case: 'formulaBinary',
                              value: {
                                left: {
                                  value: {
                                    case: 'formulaBinary',
                                    value: {
                                      left: {
                                        value: {
                                          case: 'data',
                                          value: {
                                            value: {
                                              case: 'nestedDataField',
                                              value: {
                                                rootTableName: 'transaction',
                                                linkNames: [],
                                                finalDataField: 'amount',
                                              },
                                            },
                                          },
                                        },
                                      },
                                      operator: 6,
                                      right: {
                                        value: {
                                          case: 'data',
                                          value: {
                                            value: {
                                              case: 'constant',
                                              value: {
                                                value: {
                                                  case: 'bool',
                                                  value: false,
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                                operator: 8,
                                right: {
                                  value: {
                                    case: 'data',
                                    value: {
                                      value: {
                                        case: 'constant',
                                        value: {
                                          value: {
                                            case: 'bool',
                                            value: false,
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                          operator: 6,
                          right: {
                            value: {
                              case: 'data',
                              value: {
                                value: {
                                  case: 'nestedDataField',
                                  value: {
                                    rootTableName: 'transaction',
                                    linkNames: [
                                      'entity',
                                      'AMLscoreentity',
                                      'AMLscoreentity',
                                    ],
                                    finalDataField: 'AMLscore',
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                    operator: 6,
                    right: {
                      value: {
                        case: 'data',
                        value: {
                          value: {
                            case: 'constant',
                            value: { value: { case: 'bool', value: false } },
                          },
                        },
                      },
                    },
                  },
                },
              },
              operator: 5,
              right: {
                value: {
                  case: 'formulaBinary',
                  value: {
                    left: {
                      value: {
                        case: 'formulaBinary',
                        value: {
                          left: {
                            value: {
                              case: 'data',
                              value: {
                                value: {
                                  case: 'nestedDataField',
                                  value: {
                                    rootTableName: 'transaction',
                                    linkNames: [],
                                    finalDataField: 'amount',
                                  },
                                },
                              },
                            },
                          },
                          operator: 6,
                          right: {
                            value: {
                              case: 'data',
                              value: {
                                value: {
                                  case: 'constant',
                                  value: {
                                    value: {
                                      case: 'bool',
                                      value: false,
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                    operator: 8,
                    right: {
                      value: {
                        case: 'data',
                        value: {
                          value: {
                            case: 'nestedDataField',
                            value: {
                              rootTableName: 'transaction',
                              linkNames: [
                                'entity',
                                'AMLscoreentity',
                                'AMLscoreentity',
                              ],
                              finalDataField: 'AMLscore',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        {
          value: {
            case: 'formulaUnary',
            value: {},
          },
        },
        {
          value: {
            case: 'formulaAggregation',
            value: {
              aggregation: 0,
              filters: [
                {
                  value: {
                    case: 'formulaBinary',
                    value: {
                      left: {
                        value: {
                          case: 'data',
                          value: {
                            value: {
                              case: 'nestedDataField',
                              value: {
                                rootTableName: 'transaction',
                                linkNames: [],
                                finalDataField: 'amount',
                              },
                            },
                          },
                        },
                      },
                      operator: 6,
                      right: {
                        value: {
                          case: 'data',
                          value: {
                            value: {
                              case: 'constant',
                              value: {
                                value: {
                                  case: 'bool',
                                  value: false,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                {
                  value: {
                    case: 'formulaBinary',
                    value: {
                      left: {
                        value: {
                          case: 'formulaBinary',
                          value: {
                            left: {
                              value: {
                                case: 'data',
                                value: {
                                  value: {
                                    case: 'nestedDataField',
                                    value: {
                                      rootTableName: 'transaction',
                                      linkNames: ['account'],
                                      finalDataField: 'amount',
                                    },
                                  },
                                },
                              },
                            },
                            operator: 8,
                            right: {
                              value: {
                                case: 'data',
                                value: {
                                  value: {
                                    case: 'constant',
                                    value: {
                                      value: {
                                        case: 'int',
                                        value: 3,
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                      operator: 2,
                      right: {
                        value: {
                          case: 'data',
                          value: {
                            value: {
                              case: 'constant',
                              value: {
                                value: {
                                  case: 'bool',
                                  value: false,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              ],
            },
          },
        },
        {
          value: {
            case: 'formulaVariant',
            value: {
              variantField: {
                rootTableName: 'transaction',
                variantField: 'amount',
                nestedDataFields: ['account', 'transaction'],
              },
              cases: {},
            },
          },
        },
        {
          value: {
            case: 'formulaAggregation',
            value: {
              aggregation: 1,
              filters: [
                {
                  value: {
                    case: 'formulaBinary',
                    value: {
                      left: {
                        value: {
                          case: 'data',
                          value: {
                            value: {
                              case: 'nestedDataField',
                              value: {
                                rootTableName: 'transaction',
                                linkNames: [],
                                finalDataField: 'amount',
                              },
                            },
                          },
                        },
                      },
                      operator: 6,
                      right: {
                        value: {
                          case: 'data',
                          value: {
                            value: {
                              case: 'constant',
                              value: {
                                value: {
                                  case: 'bool',
                                  value: false,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                {
                  value: {
                    case: 'formulaBinary',
                    value: {
                      left: {
                        value: {
                          case: 'formulaBinary',
                          value: {
                            left: {
                              value: {
                                case: 'data',
                                value: {
                                  value: {
                                    case: 'constant',
                                    value: {
                                      value: {
                                        case: 'int',
                                        value: 45,
                                      },
                                    },
                                  },
                                },
                              },
                            },
                            operator: 8,
                            right: {
                              value: {
                                case: 'data',
                                value: {
                                  value: {
                                    case: 'constant',
                                    value: {
                                      value: {
                                        case: 'int',
                                        value: 3,
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                      operator: 2,
                      right: {
                        value: {
                          case: 'data',
                          value: {
                            value: {
                              case: 'constant',
                              value: {
                                value: {
                                  case: 'bool',
                                  value: false,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    },
  ],
});

export const rulesFixture = {
  complex: rule,
};
