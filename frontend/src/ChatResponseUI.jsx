import { User, Train } from "lucide-react";

const ChatResponseUI = ({ message, isUser, timestamp, text, found_trains }) => {
    const hasTrains = found_trains && found_trains?.length > 0;
    
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-in slide-in-from-bottom duration-300`}>
            <div className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 flex flex-shrink-0 items-center justify-center rounded-full 
                    ${isUser ? 'bg-blue-600' : 'bg-blue-100'}`}>
                    {isUser ? (
                        <User className="w-5 h-5 text-white" />
                    ) : (
                        <Train className="w-5 h-5 text-blue-600" />
                    )}
                </div>
                <div style={{
                    borderRadius: "4px"
                }} className={`flex flex-col w-full max-w-[420px] p-4 rounded-lg shadow-sm 
                    ${isUser ? 'bg-blue-600 text-white' : 'bg-white border border-blue-100'}`}>
                    {!isUser && hasTrains && (
                        <p className="text-sm font-medium text-blue-600 mb-2">
                            Great news! We found matching trains for you:
                        </p>
                    )}
                    {!(found_trains && found_trains?.length > 0) &&
                        <p className="text-sm font-normal">{text}</p>
                    }
                    
                    {hasTrains && !isUser && (
                        <div className="mt-3 overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead className="bg-blue-50">
                                    <tr>
                                        <th className="py-1 px-2 text-left text-blue-600 font-medium">Train</th>
                                        <th className="py-1 px-2 text-left text-blue-600 font-medium">From</th>
                                        <th className="py-1 px-2 text-left text-blue-600 font-medium">To</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {found_trains.map((train, index) => (
                                        <tr key={index} className="border-b border-blue-50 hover:bg-blue-50/50">
                                            <td className="py-1 px-2">
                                                <div className="font-medium">{train.train_name}</div>
                                                <div className="text-gray-500">{train.train_number}</div>
                                            </td>
                                            <td className="py-1 px-2">{train.source_station}</td>
                                            <td className="py-1 px-2">{train.destination_station}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    
                    <span className={`text-xs mt-2 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                        {timestamp}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ChatResponseUI;
