import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { urlApi } from "../services/api";

interface QRCodePopupProps {
  isOpen: boolean;
  onClose: () => void;
  shortId: string;
}

export default function QRCodePopup({
  isOpen,
  onClose,
  shortId,
}: QRCodePopupProps) {
  const qrCodeUrl = urlApi.generateQRCode(shortId);
  const shortUrl = `${window.location.origin}/${shortId}`;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  QR Code for Short URL
                </Dialog.Title>
                <div className="mt-2">
                  <div className="flex flex-col items-center space-y-4">
                    <img
                      src={qrCodeUrl}
                      alt="QR Code"
                      className="w-48 h-48 rounded-lg shadow-lg"
                    />
                    <div className="text-sm text-gray-500 break-all text-center">
                      {shortUrl}
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(shortUrl);
                      }}
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                    >
                      Copy URL
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
