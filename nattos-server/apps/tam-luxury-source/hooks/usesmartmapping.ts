
import { useState, useEffect, useCallback } from 'react';
import { SmartLinkMappingEngine } from '../services/mapping/SmartLinkMappingEngine';
import { AccountingMappingRule, SalesEvent, AccountingEntry, RealTimeUpdate } from '../types';

export const useSmartMapping = () => {
  const [mappingEngine] = useState(() => SmartLinkMappingEngine.getInstance());
  const [rules, setRules] = useState<AccountingMappingRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realTimeUpdates, setRealTimeUpdates] = useState<RealTimeUpdate[]>([]);

  // Load initial rules
  useEffect(() => {
    const loadRules = () => {
      try {
        const loadedRules = mappingEngine.getMappingRules();
        setRules(loadedRules);
        setIsLoading(false);
      } catch (err: Error) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    loadRules();

    // Subscribe to rule updates
    const handleRuleAdded = (rule: AccountingMappingRule) => {
      setRules(prev => [...prev, rule]);
    };

    const handleRuleUpdated = (updatedRule: AccountingMappingRule) => {
      setRules(prev => prev.map(rule => 
        rule.id === updatedRule.id ? updatedRule : rule
      ));
    };

    // Subscribe to real-time events
    const handleEntriesMapped = (data: Record<string, unknown>) => {
      setRealTimeUpdates(prev => [{
        id: Date.now().toString(),
        type: 'ENTRIES_MAPPED',
        timestamp: new Date(),
        data,
        source: 'mappingEngine',
        priority: 'MEDIUM',
        processed: false
      }, ...prev.slice(0, 49)]);
    };

    mappingEngine.on('ruleAdded', handleRuleAdded);
    mappingEngine.on('ruleUpdated', handleRuleUpdated);
    mappingEngine.on('entriesMapped', handleEntriesMapped);

    return () => {
      mappingEngine.removeAllListeners();
    };
  }, [mappingEngine]);

  const mapSalesEvent = useCallback(async (event: SalesEvent): Promise<AccountingEntry[]> => {
    try {
      return await mappingEngine.autoMapSalesEvent(event);
    } catch (err: Error) {
      setError(err.message);
      throw err;
    }
  }, [mappingEngine]);

  const addRule = useCallback((rule: AccountingMappingRule) => {
    mappingEngine.addMappingRule(rule);
  }, [mappingEngine]);

  const updateRule = useCallback((id: string, updates: Partial<AccountingMappingRule>) => {
    mappingEngine.updateMappingRule(id, updates);
  }, [mappingEngine]);

  const clearRealTimeUpdates = useCallback(() => {
    setRealTimeUpdates([]);
  }, []);

  return {
    rules,
    isLoading,
    error,
    realTimeUpdates,
    mapSalesEvent,
    addRule,
    updateRule,
    clearRealTimeUpdates,
    initialized: !isLoading && !error
  };
};
